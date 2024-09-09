import React, { useEffect, useRef, useContext } from 'react';
import * as d3 from 'd3';
import { AuthContext } from './AuthContext';

// Función para generar colores pasteles
const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const pastelColor = `hsl(${hue}, 100%, 85%)`;
  return pastelColor;
};

const StageFlow = ({ stages }) => {
  const svgRef = useRef();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (stages.length === 0) return;

    // Crear nodos de inicio y fin
    const startNode = { id: 'start', name: 'Inicio', description: '', color: '#A2D5F2' };
    const endNode = { id: 'end', name: 'Fin', description: '', color: '#F2A2A2' };

    // Convertir stages a nodos
    const nodes = stages.map(stage => ({
      id: stage.ID.toString(),
      name: stage.Nombre,
      description: stage.Descripcion,
      stageAnterior: stage.StageAnterior,
      stageSiguiente: stage.StageSiguiente,
      color: getRandomPastelColor()
    }));

    // Agregar nodos de inicio y fin a la lista de nodos
    nodes.push(startNode, endNode);

    // Crear conexiones (edges) entre nodos
    const edges = stages.flatMap(stage => {
      const edges = [];
      if (stage.StageAnterior === null) {
        edges.push({ source: 'start', target: stage.ID.toString() });
      } else {
        edges.push({ source: stage.StageAnterior.toString(), target: stage.ID.toString() });
      }
      if (stage.StageSiguiente === null) {
        edges.push({ source: stage.ID.toString(), target: 'end' });
      }
      return edges;
    });

    drawGraph(nodes, edges);
  }, [stages]);

  const drawGraph = (nodes, links) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 2);

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.filter(d => d.id !== 'start' && d.id !== 'end')
      .append('rect')
      .attr('width', 120)  // Reducir el ancho del nodo
      .attr('height', 60)  // Reducir la altura del nodo
      .attr('rx', 10) // radio de las esquinas
      .attr('ry', 10) // radio de las esquinas
      .attr('fill', d => d.color);

    node.filter(d => d.id !== 'start' && d.id !== 'end')
      .append('foreignObject')
      .attr('width', 120)  // Ajustar el ancho del foreignObject
      .attr('height', 60)  // Ajustar la altura del foreignObject
      .append('xhtml:div')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('justify-content', 'center')
      .style('align-items', 'center')
      .style('width', '100%')
      .style('height', '100%')
      .style('padding', '5px')
      .style('box-sizing', 'border-box')
      .style('font-size', '10px')
      .html(d => `<div><strong>${d.name}</strong></div><div>${d.description}</div>`);

    node.filter(d => d.id === 'start' || d.id === 'end')
      .append('circle')
      .attr('r', 30)  // Reducir el tamaño del círculo
      .attr('fill', d => d.color);

    node.filter(d => d.id === 'start' || d.id === 'end')
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('font-size', '10px')  // Reducir el tamaño de la fuente
      .text(d => d.name);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x - (d.id === 'start' || d.id === 'end' ? 30 : 60)},${d.y - (d.id === 'start' || d.id === 'end' ? 30 : 30)})`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      {stages.length === 0 ? (
        <div>Actualmente no existen stages creados</div>
      ) : (
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};

export default StageFlow;
