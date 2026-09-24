import { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

const nodeTypes = {}; // Define custom node types if needed

function GraphView({ nodes: initialNodes, edges: initialEdges, onNodeClick }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);

  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (initialEdges) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);

  const handleNodeClick = useCallback((event, node) => {
    if (onNodeClick) onNodeClick(node);
  }, [onNodeClick]);

  return (
    <div style={{ width: '100%', height: '100%' }} className="rounded-xl overflow-hidden border border-[#334155]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
      >
        <Controls className="bg-[#1e293b] border-[#334155] fill-[#f1f5f9]" />
        <MiniMap 
          nodeColor={(n) => {
            if (n.data?.cpse === 'ONGC') return '#ef4444';
            if (n.data?.cpse === 'BPCL') return '#3b82f6';
            if (n.data?.cpse === 'IOC') return '#22c55e';
            return '#94a3b8';
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          style={{ backgroundColor: '#1e293b' }}
        />
        <Background color="#334155" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}

export default GraphView;
