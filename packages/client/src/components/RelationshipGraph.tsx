import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { trpc } from "@/lib/api";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: "person" | "device" | "location";
  risk: "high" | "medium" | "low";
  image?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  id: string;
  strength: number;
}

interface RelationshipGraphProps {
  onNodeClick?: (node: Node) => void;
}

export const RelationshipGraph = ({ onNodeClick }: RelationshipGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  const { data: config, isPending: isConfigPending } = trpc.config.useQuery();
  const { data: chatsData, isPending: isChatsPending } = trpc.data.useQuery();

  // Memoize the data to prevent re-generation on every render
  const { nodes, links } = useMemo(() => {
    if (!chatsData?.messages) {
      return { nodes: [], links: [] };
    }

    const nodes: Node[] = [];
    const links: Link[] = [];
    const nodeMap = new Map<string, Node>();
    const currentUser = chatsData.current_user.name;

    // Add current user as a node
    const currentUserNode: Node = {
      id: currentUser.toLowerCase().replace(/\s+/g, '-'),
      name: currentUser,
      type: "person",
      risk: "high", // Current user is high risk based on the conversations
      image: chatsData.current_user.image,
    };
    nodes.push(currentUserNode);
    nodeMap.set(currentUser.toLowerCase(), currentUserNode);

    // Process each chat to extract users and create relationships
    chatsData.messages.forEach((chat, chatIndex) => {
      const otherUser = chat.username;
      const otherUserKey = otherUser.toLowerCase().replace(/\s+/g, '-');
      
      // Calculate risk level based on message content
      const allMessages = chat.messages.join(' ').toLowerCase();
      const suspiciousWords = [
        'drug', 'dealer', 'police', 'arrested', 'weed', 'steroids', 
        'abduction', 'trafficking', 'mafia', 'illegal', 'smuggle',
        'organ', 'spare parts', 'black money', 'cash', 'no upi'
      ];
      
      const suspiciousScore = suspiciousWords.reduce((score, word) => {
        return score + (allMessages.includes(word) ? 1 : 0);
      }, 0);
      
      let risk: "high" | "medium" | "low" = "low";
      if (suspiciousScore >= 5) risk = "high";
      else if (suspiciousScore >= 2) risk = "medium";

      // Create node for the other user if not already exists
      if (!nodeMap.has(otherUserKey)) {
        const otherUserNode: Node = {
          id: otherUserKey,
          name: otherUser,
          type: "person",
          risk,
          image: chat.profile?.image,
        };
        nodes.push(otherUserNode);
        nodeMap.set(otherUserKey, otherUserNode);
      }

      // Create link between current user and other user
      const linkStrength = Math.min(0.3 + (suspiciousScore * 0.1), 0.9);
      links.push({
        id: `${currentUser.toLowerCase()}-${otherUserKey}`,
        source: currentUser.toLowerCase(),
        target: otherUserKey,
        strength: linkStrength,
      });
    });

    return { nodes, links };
  }, [chatsData]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Stable node click handler
  const handleNodeClick = useCallback(
    (node: Node) => {
      if (onNodeClick) {
        onNodeClick(node);
      }
    },
    [onNodeClick]
  );

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0 || nodes.length === 0)
      return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    // Clear previous content
    svg.selectAll("*").remove();

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    const g = svg.append("g");

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35));

    // Apply preserved positions if available
    nodes.forEach(node => {
      const preserved = nodePositions.get(node.id);
      if (preserved) {
        node.x = preserved.x;
        node.y = preserved.y;
        node.fx = preserved.x;
        node.fy = preserved.y;
      }
    });

    simulationRef.current = simulation;

    // Create links
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#64748b")
      .attr("stroke-width", (d) => Math.sqrt(d.strength * 5))
      .attr("stroke-opacity", 0.6);

    // Create image definitions
    const defs = svg.append("defs");

    nodes.forEach((d) => {
      const pattern = defs
        .append("pattern")
        .attr("id", `image-${d.id}`)
        .attr("patternUnits", "objectBoundingBox")
        .attr("width", 1)
        .attr("height", 1);

      pattern
        .append("image")
        .attr("href", d.image)
        .attr("width", 50)
        .attr("height", 50)
        .attr("preserveAspectRatio", "xMidYMid slice");
    });

    // Create nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        handleNodeClick(d);
      })
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Add circles for nodes with images
    node
      .append("circle")
      .attr("r", 25)
      .attr("fill", (d) => `url(#image-${d.id})`)
      .attr("stroke", (d) => {
        const colors = {
          high: "#ef4444",
          medium: "#f59e0b",
          low: "#10b981",
        };
        return colors[d.risk];
      })
      .attr("stroke-width", 1);

    // Add labels
    node
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", 40)
      .attr("font-size", "10px")
      .attr("fill", "#e2e8f0")
      .attr("font-weight", "bold");

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Save positions when simulation ends
    simulation.on("end", () => {
      const positions = new Map<string, { x: number; y: number }>();
      nodes.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          positions.set(node.id, { x: node.x, y: node.y });
        }
      });
      setNodePositions(positions);
      
      // Release fixed positions after saving
      nodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });
    });

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [dimensions, nodes, links, handleNodeClick]);

  if (isConfigPending || isChatsPending) {
    return (
      <div className="relative w-full h-full bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center">
        <div className="text-white">Loading relationship graph...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden"
    >
      <div className="absolute top-4 left-4 z-10">
        <div className="text-white text-lg font-semibold mb-2">
          {config?.current_user.name}
        </div>
        <div className="text-slate-400 text-sm">Instagram</div>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: "transparent" }}
      />
    </div>
  );
};
