import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Background,
  BackgroundVariant,
} from "react-flow-renderer";
import { nodes as initialNodes, edges as initialEdges } from "./elements";
import { Button, Modal, Input, Form, Dropdown, Menu } from "antd";
import { DeleteOutlined, DownOutlined } from "@ant-design/icons";
import axios from 'axios';

function ReactFlowRenderer() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteDropdownVisible, setDeleteDropdownVisible] = useState(false);
  const [show, setShow] = useState(true);

  const onConnect = useCallback(
    (params) => {
      // console.log('New edge source:', params);
      // console.log('New edge target:', typeof params.target);
      const token = localStorage.getItem("token");

      const response = axios.put(
        "http://localhost:8000/update-source/",
        {
          map_id: params.source,
          source: params.source,
          target: params.target
        },
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: ConnectionLineType.SmoothStep,
            animated: true,
            style: { stroke: "red" },
          },
          eds,
        )
      );
    },
    [setEdges]
  );

  useEffect(() => {
    nodes.map((node) => {
      console.log(node.id)
    })
  }, []);

  const getNodeId = () => Math.random();

  function onInit() {
    if (show) {
      showMap();
      setShow(false);
    }
  }

  function displayCustomNamedNodeModal() {
    setIsModalVisible(true);
  }

  function handleCancel() {
    setIsModalVisible(false);
  }

  function handleOk(data) {
    onAdd(data.nodeName);
    setIsModalVisible(false);
  }

  const getMap = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:8000/get-map/",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  }

  const showMap = async () => {
    const data = getMap();
    data.then(response => {
      const responses = response

      for (var i = 0; i < responses.length; i++) {
        const id = "" + responses[i].map_id;
        const newNode = {
          id: id,
          data: { label: responses[i].data },
          position: {
            x: responses[i].x,
            y: responses[i].y,
          },
        };

        if (responses[i].source !== ""){
          console.log("e" + responses[i].source + "-" + responses[i].target)
          const newEdge = {
            id: "e" + responses[i].source + "-" + responses[i].target,
            source: responses[i].source,
            target: responses[i].target,
            type: "smoothstep",
            animated: true
          }
          
          setEdges((nds) => addEdge({
            ...newEdge}, 
            nds
            )
          );
        }

        setNodes((nds) => nds.concat(newNode));
      }
    })
  }

  const onAdd = useCallback(
    (data) => {
      const token = localStorage.getItem("token");

      const response = axios.post(
        "http://localhost:8000/add-map/",
        { data: data, x: 50, y: 0 },
        { headers: { "content-type": "application/json", Authorization: `Bearer ${token}` } }
      );

      const responses = axios.get(
        "http://localhost:8000/get-map-last/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      responses.then((response) => {
        const responses = response.data;

        const id = "" + responses.map_id

        const newNode = {
          id: id,
          data: { label: responses.data },
          position: {
            x: responses.x,
            y: responses.y,
          },
        };
        setNodes((nds) => nds.concat(newNode));
      })
    },
    [setNodes]
  );

  function handleDelete(nodeId) {
    const token = localStorage.getItem("token");
    const response = fetch("http://localhost:8000/delete-map/", {
      method: "DELETE",
      body: JSON.stringify({ map_id: nodeId }),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });

    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
  }

  const handleDeleteClick = () => {
    setDeleteDropdownVisible(true);
  };

  const handleDeleteDropdownVisibleChange = (visible) => {
    setDeleteDropdownVisible(visible);
  };

  const handleDeleteMenuItemClick = () => {
    setDeleteDropdownVisible(false);
  };

  const onNodeDragStop = (event, node) => {
    console.log(node.id)
    const { x, y } = node.position;
    const token = localStorage.getItem("token");

    const response = axios.put(
      "http://localhost:8000/update-xy/",
      {
        map_id: node.id,
        x: x,
        y: y
      },
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  
  return (
    <div style={{ height: "77vh", margin: "1rem" }}>
      <Modal title="Basic Modal" open={isModalVisible} onCancel={handleCancel}>
        <Form onFinish={handleOk} autoComplete="off" name="new node">
          <Form.Item label="Node Name" name="nodeName">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <div className="buttons">
        <Button className="node-buttons add" type="primary" onClick={displayCustomNamedNodeModal}>
          Add Node
        </Button>

        <Dropdown
          overlay={
            <Menu onClick={handleDeleteMenuItemClick}>
              {nodes.map((node) => (
                <Menu.Item key={node.id}>
                  <Button onClick={() => handleDelete(node.id)}>
                    <DeleteOutlined /> {node.data.label}
                  </Button>
                </Menu.Item>
              ))}
            </Menu>
          }
          open={deleteDropdownVisible}
          onOpenChange={handleDeleteDropdownVisibleChange}
        >
          <Button className="node-buttons delete" type="primary" onClick={handleDeleteClick}>
            Delete <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        fitView
        attributionPosition="bottom-left"
        connectionLineType={ConnectionLineType.SmoothStep}
        onNodeDragStop={onNodeDragStop}
      >
        <Background gap={20} color="#f1f1f1" variant={BackgroundVariant.Lines} />

      </ReactFlow>
    </div>
  );
}

export default ReactFlowRenderer;
