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
  const [demoFile, setDemoFile] = useState();
  const [jsonData, setJsonData] = useState(null); // Initialize jsonData as null
  const [file, setFile] = useState();
  const [snvCheckboxChecked, setSNVCheckboxChecked] = useState(false);
  const [snvId, setSNVId] = useState('');

  let filteredJsonData = null;
  // Helper function to find the segment for a given SNV ID
  const findSegmentForSNV = (snvId) => {
      if (jsonData !== null) {
          const snv = jsonData.snvs.find(snv => {
              return snv.snv_id === parseInt(snvId); // Convert snvId to number before comparison
          });
          if (snv) {
              const segmentId = snv.segment_id;
              return segmentId; // Return the segmentId
          } else {
              console.log(`SNV ID ${snvId} not found.`);
              return null; // Return null if SNV ID not found
          }
      }
  };


  const dfsPostorder = (jsonData, snvId, segmentId) => {
      if (!jsonData || !jsonData.tree || !jsonData.tree.nodes || !jsonData.tree.edges) {
          console.log("Invalid JSON structure.");
          return;
      }

      // Find the root node
      let rootNode;
      for (const node of jsonData.tree.nodes) {
          if (!jsonData.tree.edges.some(edge => edge[1] === node.node_id)) {
              rootNode = node;
              break;
          }
      }

      if (!rootNode) {
          console.log("Root node not found.");
          return;
      }

      // Create filtered lists for nodes and edges
      let filteredNodes = [...jsonData.tree.nodes];
      let filteredEdges = [...jsonData.tree.edges];
      console.log("Filtered nodes after removal:", filteredNodes);
      const traverse = (nodeId, parentNode) => {
          const node = filteredNodes.find(node => node.node_id === nodeId);
          if (!node) {
              return;
          }

          // Traverse child nodes
          const edges = filteredEdges.filter(edge => edge[0] === nodeId);
          for (const edge of edges) {
              const childNodeId = edge[1];
              traverse(childNodeId, node); // Pass the parent node ID as an argument
          }

          // Process the current node
          console.log("Processing node:", nodeId);
          if (parentNode !== null) {
              const snv = node.snvs.find(snv => snv.snv_id === parseInt(snvId));
              const parent_snv = parentNode.snvs.find(parent_snv => parent_snv.snv_id === parseInt(snvId));
              const segment = node.segments.find(segment => segment.segment_id === parseInt(segmentId));
              const parent_segment = parentNode.segments.find(parent_segment => parent_segment.segment_id === parseInt(segmentId));
              if (snv && parent_snv && segment && parent_segment) {
                if (snv.x_bar === parent_snv.x_bar && snv.y_bar === parent_snv.y_bar && segment.x === parent_segment.x && segment.y === parent_segment.y) {
                  console.log("the same as the parent node.");
              
                  // Check if the node has any children
                  const childrenEdges = filteredEdges.filter(edge => edge[0] === node.node_id);
                  for (const childEdge of childrenEdges) {
                      // Add edges between parent node and children
                      filteredEdges.push([parentNode.node_id, childEdge[1]]);
                  }
              
                  // Remove the node from filteredNodes list
                  filteredNodes = filteredNodes.filter(n => n.node_id !== node.node_id);
                  console.log("Filtered nodes after removal:", filteredNodes);
              
                  // Remove edges from filteredEdges that have the node as a child
                  filteredEdges = filteredEdges.filter(edge => edge[1] !== node.node_id && edge[0] !== node.node_id);
                  console.log("Filtered edges after removal:", filteredEdges);
                } else {
                      console.log("x_bar and y_bar are different from the parent node.");
                }
              }
              console.log("Filtered edges after removal:", filteredEdges);
          }
      };

      // Start traversal from the root node
      traverse(rootNode.node_id, null);
      filterBySNV(filteredNodes, filteredEdges);
      filterJson(filteredNodes, filteredEdges);
  };

  

    const filterJson = (filteredNodes, filteredEdges) => {
      try {
        const { tree } = jsonData;

        // Remove nodes that are not present in the filteredNodes list
        const filteredTreeNodes = tree.nodes.filter(node => filteredNodes.some(filteredNode => filteredNode.node_id === node.node_id));

        // Replace edges with the filteredEdges list
        const filteredTreeEdges = filteredEdges;

        // Create a new JSON object with filtered nodes and edges
        filteredJsonData = {
          ...jsonData,
          tree: {
            ...tree,
            nodes: filteredTreeNodes,
            edges: filteredTreeEdges
          }
        };

        return filteredJsonData;
      } catch (error) {
        console.error('Error creating JSON:', error);
        return null;
      }
    };
  function filterBySNV(nodes, edges) {
      try {
          const elements = {
              nodes: nodes.map((node) => ({
                  data: {
                      id: node.node_id.toString(),
                      label: node.node_id.toString(),
                  },
                  position: { x: node.segments[0].x, y: node.segments[0].y },
              })),
              edges: edges.map((edge) => ({
                  data: {
                      source: edge[0].toString(),
                      target: edge[1].toString(),
                  },
              })),
          };

          const cy = cytoscape({
              container: cyRef.current,
              elements: elements,
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
                          'target-arrow-shape': 'triangle',
                          'target-arrow-color': '#34495e',
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
      }
  }



  function updateTree(jsonData) {
    try {
      setJsonData(jsonData); // Set the parsed JSON data to the state

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
              'target-arrow-shape': 'triangle',
              'target-arrow-color': '#34495e',
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
    }
  }

  function handleChange(event) {
    if (event !== undefined) {
      setFile(event.target.files[0]);
    }
  }

  function handleSubmit(event) {
    if (event !== undefined) {
      event.preventDefault();
      if (file !== undefined) {
        file.text().then((result) => {
          const jsonData = JSON.parse(result); // Parse the result
          updateTree(jsonData); // Pass jsonData to updateTree function
        });
      }
    }
  }


  // Define the handleSNVFilter function
  const handleSNVFilter = () => {
    // Print the SNV ID inputted by the user
    console.log("SNV ID:", snvId);

    // Call the helper function to find the segment for the SNV ID
    const segmentId = findSegmentForSNV(snvId); // Pass jsonData here

    // Call the DFS postorder traversal passing jsonData
    dfsPostorder(jsonData, snvId, segmentId);
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

  // function handleSubmit(event) {
  //   if (event !== undefined) {
  //     event.preventDefault()
  //     if (file !== undefined) {
  //       file.text().then((result) => {
  //         // console.log(result)
  //         updateTree(result);
  //       })
  //     }
  //   }
  // };

  function handleSubmitDemoFile(event) {
    if (event !== undefined) {
      event.preventDefault()
      if (demoFile !== undefined) {
        const jsonData = JSON.parse(JSON.stringify(demoFile)); // Parse the result
        updateTree(jsonData);
      }
    }
  };

  return (
    <div>
      <div className="App">
        <Sidebar onsubmitSelectedFile={handleSubmit} 
        onSelectFile={handleChange} 
        selectedFile={file} 
        demoFiles={demoFiles} 
        onSelectDemoFile={handleSelectDemoFile} 
        onSubmitDemoForm={handleSubmitDemoFile}
        handleSNVFilter={handleSNVFilter} // Pass the function here
        snvCheckboxChecked={snvCheckboxChecked} // Pass the checkbox status
        setSNVCheckboxChecked={setSNVCheckboxChecked} // Pass the setter function
        snvId={snvId} // Pass the SNV ID
        setSNVId={setSNVId} // Pass the setter function
        filteredJson={filteredJsonData}
        />
      </div>
      <div id="cy" style={{ width: '100%', height: '100vh' }} ref={cyRef}></div>
    </div>
  );
};

export default App;
