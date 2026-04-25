import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { RemoteAgent } from '../types';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  status: string;
  type: 'agent' | 'controller';
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

export const AgentNetworkGraph: React.FC<{ agents: RemoteAgent[]; onSelect?: (id: string) => void }> = ({ agents, onSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const nodes: Node[] = [
      { id: 'controller', name: 'NYX_CORE', status: 'online', type: 'controller' },
      ...agents.map(a => ({ id: a.id, name: a.name, status: a.status, type: 'agent' as const }))
    ];

    const links: Link[] = agents.map(a => ({
      source: 'controller',
      target: a.id
    }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3.5")
      .attr("result", "blur");
    filter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#ffffff10")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .attr("class", "link");

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", d => d.type === 'agent' ? "pointer" : "default")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any)
      .on("click", (_event, d) => d.type === 'agent' && onSelect?.(d.id));

    node.append("circle")
      .attr("r", d => d.type === 'controller' ? 14 : 9)
      .attr("fill", d => d.status === 'online' ? (d.type === 'controller' ? "#cff80c" : "#cff80c20") : "#ffffff05")
      .attr("stroke", d => d.status === 'online' ? "#cff80c" : "#ffffff10")
      .attr("stroke-width", 1.5)
      .style("filter", d => d.status === 'online' ? "url(#glow)" : "none");

    node.append("text")
      .text(d => d.name)
      .attr("x", 16)
      .attr("y", 4)
      .attr("fill", d => d.status === 'online' ? "#cff80c" : "#ffffff40")
      .attr("font-size", "9px")
      .attr("font-weight", "900")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("class", "node-label")
      .attr("pointer-events", "none")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.1em");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        simulation.force("center", d3.forceCenter(containerRef.current.clientWidth / 2, containerRef.current.clientHeight / 2));
        simulation.alpha(0.3).restart();
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, [agents, onSelect]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] relative bg-black/20 rounded-xl border border-white/5 overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[8px] font-black uppercase text-primary tracking-widest font-mono">Real-Time Topology</span>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
