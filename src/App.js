import React, { useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import demoFile1 from './demo_json/s11_m5000_k25_l7_n1000_c0.25_e0.json';
import demoFile2 from './demo_json/s14_m5000_k25_l7_n1000_c0.25_e0.json';

cytoscape.use(dagre);

const App = () => {
  const cyRef = useRef(null);
  const [file, setFile] = useState();
  const [demoFile, setDemoFile] = useState();

  function updateTree(jsonFile) {
    try {
      const jsonData = JSON.parse(jsonFile);

      const cy = cytoscape({
        container: cyRef.current,
        elements: {
          nodes: jsonData.tree.nodes.map((node) => ({
            data: {
              id: node.node_id.toString(),
              label: node.node_id.toString(),
            },
            position: { x: node.segments[0].x, y: node.segments[0].y },
          })),
          edges: jsonData.tree.edges.map((edge) => ({
            data: {
              source: edge[0].toString(),
              target: edge[1].toString(),
            },
          })),
        },
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              shape: 'ellipse',
              width: 'label',
              height: 'label',
              padding: '10px',
              'background-color': '#3498db',
              color: '#ffffff',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#34495e',
            },
          },
        ],
        layout: {
          name: 'dagre',
        },
      });

      cy.layout({ name: 'dagre' }).run();
    } catch (error) {
      console.error('Error loading JSON:', error);
      // Alert.alert(error);
    }
  };

  function handleChange(event) {
    if (event !== undefined) {
      setFile(event.target.files[0])
    }
  };

  const demoFiles = [
    { id: 1, name: 'Demo File 1', content: demoFile1 },
    { id: 2, name: 'Demo File 2', content: demoFile2 },
  ];

  function handleSelectDemoFile(selectedDemoFileId) {
    // Handle the selection of a demo file
    const selectedDemoFile = demoFiles.find((file) => file.id === Number(selectedDemoFileId));
    if (selectedDemoFile) {
      setDemoFile(selectedDemoFile.content);
    }
  };

  function handleSubmit(event) {
    if (event !== undefined) {
      event.preventDefault()
      if (file !== undefined) {
        file.text().then((result) => {
          // console.log(result)
          updateTree(result);
        })
      }
    }
  };

  function handleSubmitDemoFile(event) {
    if (event !== undefined) {
      event.preventDefault()
      if (demoFile !== undefined) {
        updateTree(JSON.stringify(demoFile));
      }
    }
  };

  return (
    <div>
      <div className="App">
        <Sidebar onsubmitSelectedFile={handleSubmit} onSelectFile={handleChange} selectedFile={file} demoFiles={demoFiles} onSelectDemoFile={handleSelectDemoFile} onSubmitDemoForm={handleSubmitDemoFile}/>
      </div>
      <div id="cy" style={{ width: '100%', height: '100vh' }} ref={cyRef}></div>
    </div>
  );
};

export default App;
