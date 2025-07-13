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

  const { data: config, isPending: isConfigPending } = trpc.config.useQuery();

  // Memoize the mock data to prevent re-generation on every render
  const { nodes, links } = useMemo(() => {
    const nodes: Node[] = [
      {
        id: "john",
        name: "John Doe",
        type: "person",
        risk: "high",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      },
      {
        id: "jane",
        name: "Jane Smith",
        type: "person",
        risk: "medium",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      },
      {
        id: "mike",
        name: "Mike Johnson",
        type: "person",
        risk: "low",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
      {
        id: "device1",
        name: "Laptop-001",
        type: "device",
        risk: "medium",
        image:
          "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=100&h=100&fit=crop",
      },
      {
        id: "device2",
        name: "Phone-002",
        type: "device",
        risk: "high",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop",
      },
      {
        id: "loc1",
        name: "Office-A",
        type: "location",
        risk: "low",
        image:
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
      },
      {
        id: "loc2",
        name: "Cafe-B",
        type: "location",
        risk: "medium",
        image:
          "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&h=100&fit=crop",
      },
    ];

    const links: Link[] = [
      { id: "john-jane", source: "john", target: "jane", strength: 0.8 },
      { id: "john-device1", source: "john", target: "device1", strength: 0.9 },
      { id: "jane-device2", source: "jane", target: "device2", strength: 0.7 },
      { id: "mike-loc1", source: "mike", target: "loc1", strength: 0.6 },
      { id: "john-loc2", source: "john", target: "loc2", strength: 0.5 },
      { id: "device1-loc1", source: "device1", target: "loc1", strength: 0.4 },
    ];

    return { nodes, links };
  }, []);

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
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0)
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
      .attr("stroke-width", 3);

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

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [dimensions, nodes, links, handleNodeClick]);

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
