import React, { useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';

cytoscape.use(dagre);

const App = () => {
  const cyRef = useRef(null);
  const [file, setFile] = useState()

  function updateTree(jsonFile) {
    try {
      const jsonData = JSON.parse(jsonFile)

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
  }

  function handleChange(event) {
    if (event !== undefined) {
      setFile(event.target.files[0])
    }
  }

  function handleSubmit(event) {
    if (event !== undefined) {
      event.preventDefault()
      if (file !== undefined) {
        file.text().then((result) => {
          updateTree(result);
        })
      }
    }
  }

  return (
    <div>
      <div className="App">
        <Sidebar submitFile={handleSubmit} fileChange={handleChange}/>
        {/* <form onSubmit={handleSubmit}>
          <input type='file' onChange={handleChange}/>
          <button type='submit'>Upload</button>
        </form> */}
      </div>
      <div id="cy" style={{ width: '100%', height: '100vh' }} ref={cyRef}></div>
    </div>
  );
};

export default App;
