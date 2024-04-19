import React, { useRef, useState, useEffect } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import Sidebar from './components/Sidebar';
import demoFile1 from './demo_json/s11_m5000_k25_l7_n1000_c0.25_e0.json';
import demoFile2 from './demo_json/s14_m5000_k25_l7_n1000_c0.25_e0.json';
import BarChart from './components/BarChart';

cytoscape.use(dagre);

const App = () => {
  const cyRef = useRef(null);
  const [file, setFile] = useState();
  const [demoFile, setDemoFile] = useState();
  const [segmentData, setSegmentData] = useState({});
  const [countSNVData, setCountSNVData] = useState({});
  const [isDemo, setIsDemo] = useState(false);
  const [jsonData, setJsonData] = useState(null); // Initialize jsonData as null
  const [filteredJsonData, setFilteredJsonData] = useState(null); // Initialize jsonData as null
  const [snvCheckboxChecked, setSNVCheckboxChecked] = useState(false);
  const [snvId, setSNVId] = useState('');

  useEffect(() => {
    // Function to update the tree with countSNVData
    const updateTreeWithSNVData = (jsonFile) => {
      updateTree(jsonFile);
    };

    // Call updateTree only when countSNVData is updated
    if (isDemo) {
      if (demoFile) {
        updateTreeWithSNVData(JSON.stringify(demoFile));
      }
    } else {
      if (file) {
        file.text().then((result) => {
          updateTreeWithSNVData(result);
        });
      }
    }
    
  }, [countSNVData]);

  function calculateSNVsGainedLost(jsonFile) {
    try {
      const jsonData = JSON.parse(jsonFile);
      // Reset countSNVData to an empty object
      setCountSNVData({});

      let snvCounts = {}; // Object to store SNV counts per node
    
      // Iterate over each edge in the tree
      jsonData.tree.edges.forEach(edge => {
        const parent_id = edge[0];
        const child_id = edge[1];
        
        // Set the default SNV counts
        if (!snvCounts.hasOwnProperty(parent_id)) {
          snvCounts[parent_id] = { "snvs_gained": 0, "snvs_lost": 0 };
        }
        if (!snvCounts.hasOwnProperty(child_id)) {
          snvCounts[child_id] = { "snvs_gained": 0, "snvs_lost": 0 };
        }

        // Find the corresponding parent SNV list and child SNV list
        let parent_snvs = [];
        let child_snvs = [];
        jsonData.tree.nodes.forEach(node => {
          const node_id = node.node_id;
          if (node_id === parent_id) {
            parent_snvs = node.snvs;
          }
          if (node_id === child_id) {
            child_snvs = node.snvs;
          }
        });

        // Sort the lists in ascending order of "snv_id"
        parent_snvs.sort((a, b) => a.snv_id - b.snv_id);
        child_snvs.sort((a, b) => a.snv_id - b.snv_id);
        
        // Iterate through the snv lists and calculate the deltas across
        for (let i = 0; i < parent_snvs.length; i++) {
          const delta_x = child_snvs[i]["x_bar"] - parent_snvs[i]["x_bar"];
          const delta_y = child_snvs[i]["y_bar"] - parent_snvs[i]["y_bar"];
          if (parent_snvs[i]["x_bar"] === 0 && delta_x > 0) {
            snvCounts[child_id]["snvs_gained"] += delta_x;
          }
          if (child_snvs[i]["x_bar"] === 0 && delta_x < 0) {
            snvCounts[child_id]["snvs_lost"] += (-1 * delta_x);
          }
          if (parent_snvs[i]["y_bar"] === 0 && delta_y > 0) {
            snvCounts[child_id]["snvs_gained"] += delta_y;
          }
          if (child_snvs[i]["y_bar"] === 0 && delta_y < 0) {
            snvCounts[child_id]["snvs_lost"] += (-1 * delta_y);
          }
        }

      });
    
      console.log(snvCounts);
      setCountSNVData(snvCounts); // Update segmentData state

    } catch (error) {
      console.error('Error loading JSON:', error);
    }
  }

  function countSNVsPerSegment(jsonFile) {
    try {
      const jsonData = JSON.parse(jsonFile);

      // Reset segmentData to an empty object
      setSegmentData({});
      
      const snvs = jsonData.snvs;

      const updatedSegmentData = {}; // Initialize updatedSegmentData

      snvs.forEach(snv => {
        const segmentId = snv.segment_id;
        if (updatedSegmentData[segmentId]) {
          updatedSegmentData[segmentId]++;
        } else {
          updatedSegmentData[segmentId] = 1;
        }
      });

      setSegmentData(updatedSegmentData); // Update segmentData state

    } catch (error) {
      console.error('Error loading JSON:', error);
    }
  }

  //let filteredJsonData = null;
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


  const dfsPostorder = (jsonData, snvIds, segmentIds) => {
    // Check if jsonData or necessary properties are not present
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
  
    // Create a Map to track node differences
    const nodeDifferences = new Map();
  
    // Implement the rest of the function
    const traverse = (nodeId, parentNode, snvId, segmentId) => {
      const node = jsonData.tree.nodes.find(node => node.node_id === nodeId);
      if (!node) {
        return;
      }
  
      // Traverse child nodes
      const edges = jsonData.tree.edges.filter(edge => edge[0] === nodeId);
      for (const edge of edges) {
        const childNodeId = edge[1];
        traverse(childNodeId, node, snvId, segmentId); // Pass the parent node ID as an argument
      }
  
      // Process the current node
      if (parentNode !== null) {
        const snv = node.snvs.find(snv => snv.snv_id === snvId);
        const parent_snv = parentNode.snvs.find(parent_snv => parent_snv.snv_id === snvId);
        const segment = node.segments.find(segment => segment.segment_id === segmentId);
        const parent_segment = parentNode.segments.find(parent_segment => parent_segment.segment_id === segmentId);
        if (snv && parent_snv && segment && parent_segment) {
          if (!(snv.x_bar === parent_snv.x_bar && snv.y_bar === parent_snv.y_bar && segment.x === parent_segment.x && segment.y === parent_segment.y)) {
            //console.log("x_bar and y_bar are different from the parent node.");
            nodeDifferences.set(nodeId, true); // Mark the node as different
          } else {
            //console.log("the same as the parent node.");
          }
        }
      }
    };

    // Loop through each combination of SNV IDs and segment IDs
    for (const snvId of snvIds) {
      for (const segmentId of segmentIds) {
        // Traverse the tree
        traverse(rootNode.node_id, null, snvId, segmentId);
      }
    }
  
    // // Create filtered nodes and edges based on differences map
    // let filteredNodes = jsonData.tree.nodes.filter(node => !nodeDifferences.has(node.node_id));
    // let filteredEdges = jsonData.tree.edges.filter(edge => {
    //   // Check if both source and target nodes are not marked as different
    //   return !nodeDifferences.has(edge[0]) && !nodeDifferences.has(edge[1]);
    // });
    // Create filtered lists for nodes and edges
    let filteredNodes = [...jsonData.tree.nodes];
    let filteredEdges = [...jsonData.tree.edges];

    // DFS from children of nodes marked as different
    const dfsFromChildren = (nodeId, parentNode) => {
      const node = jsonData.tree.nodes.find(node => node.node_id === nodeId);
      if (!node) {
        return;
      }
  
      // Traverse child nodes
      const edges = jsonData.tree.edges.filter(edge => edge[0] === nodeId);
      for (const edge of edges) {
        const childNodeId = edge[1];
        dfsFromChildren(childNodeId, node); // Pass the parent node ID as an argument
      }
  
      // Process the current node
      if (parentNode !== null) {
        if (!nodeDifferences.get(nodeId)) {
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
        console.log("Filtered edges after removal:", filteredEdges);
      }
    };
    // const visited = new Set();
    // const dfsFromChildren = (nodeId) => {
    //   visited.add(nodeId);
    //   const childrenEdges = jsonData.tree.edges.filter(edge => edge[0] === nodeId);
    //   for (const childEdge of childrenEdges) {
    //     const childNodeId = childEdge[1];
    //     if (!visited.has(childNodeId) && nodeDifferences.has(childNodeId)) {
    //       // Remove the node from filteredNodes list
    //       filteredNodes = filteredNodes.filter(n => n.node_id !== childNodeId);
    //       console.log("Filtered nodes after removal:", filteredNodes);
          
    //       // Remove edges from filteredEdges that have the node as a child
    //       filteredEdges = filteredEdges.filter(edge => edge[1] !== childNodeId && edge[0] !== childNodeId);
    //       console.log("Filtered edges after removal:", filteredEdges);

    //       // Traverse further if needed
    //       dfsFromChildren(childNodeId);
    //     }
    //   }
    // };

    // for (const [nodeId, isDifferent] of nodeDifferences.entries()) {
    //   if (isDifferent && !visited.has(nodeId)) {
    //     dfsFromChildren(nodeId);
    //   }
    // }

    dfsFromChildren(rootNode.node_id, null);
    //dfsFromChildren(rootNode.node_id);
    // Print or return filteredNodes and filteredEdges as needed
    console.log("Filtered nodes after removal:", filteredNodes);
    console.log("Filtered edges after removal:", filteredEdges);
    filterBySNV(filteredNodes, filteredEdges);
    filterJson(filteredNodes, filteredEdges);
  };

  const filterJson = (filteredNodes, filteredEdges) => {
    try {
      // const jsonData = JSON.parse(jsonFile);
      const { tree } = jsonData;

      // Remove nodes that are not present in the filteredNodes list
      const filteredTreeNodes = tree.nodes.filter(node => filteredNodes.some(filteredNode => filteredNode.node_id === node.node_id));

      // Replace edges with the filteredEdges list
      const filteredTreeEdges = filteredEdges;

      // Create a new JSON object with filtered nodes and edges
      const filteredJsonData = {
        ...jsonData,
        tree: {
          ...tree,
          nodes: filteredTreeNodes,
          edges: filteredTreeEdges
        }
      };
      setFilteredJsonData(filteredJsonData);
      //return filteredJsonData;
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

  function updateTree(jsonFile) {
    try {
      const jsonData = JSON.parse(jsonFile);
      setJsonData(jsonData); // Set the parsed JSON data to the state

      const cy = cytoscape({
        container: cyRef.current,
        elements: {
          nodes: jsonData.tree.nodes.map((node) => ({
            data: {
              id: node.node_id.toString(),
              label: getNodeLabel(node),
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
              padding: '40px',
              'background-color': '#3498db',
              color: '#ffffff',
              'min-width': '120px', // Set minimum width
              'min-height': '50px', // Set minimum height
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
  
      cy.nodes().forEach(node => {
        node.data('label', getNodeLabel(jsonData.tree.nodes.find(n => n.node_id.toString() === node.id())));
      });
  
    } catch (error) {
      console.error('Error loading JSON:', error);
    }
  };
  
  function getNodeLabel(node) {
    const nodeData = countSNVData[node.node_id];
    if (nodeData) {
      return `+${nodeData.snvs_gained}, -${nodeData.snvs_lost}`;
    } else {
      return `Node ID: ${node.node_id}`;
    }
  }  
  

  function handleChange(event) {
    if (event !== undefined) {
      setFile(event.target.files[0]);
    }
  }

  // Define the handleSNVFilter function
  const handleSNVFilter = (snvIds) => {
    // Print the SNV ID inputted by the user
    console.log("SNV ID:", snvCheckboxChecked);
    if (snvCheckboxChecked) {
      // Call the helper function to find the segment for the SNV ID
      const segmentIds = []; // Initialize an empty array to store segment IDs
      for (const snvId of snvIds) {
        const segmentId = findSegmentForSNV(snvId); // Pass jsonData here
        segmentIds.push(segmentId); // Push segmentId to the array
      }

      // Call the DFS postorder traversal passing jsonData
      dfsPostorder(jsonData, snvIds, segmentIds);
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
          calculateSNVsGainedLost(result);
          countSNVsPerSegment(result);
          setIsDemo(false);
          // updateTree(result);
        })
      }
    }
  };

  function handleSubmitDemoFile(event) {
    if (event !== undefined) {
      event.preventDefault()
      if (demoFile !== undefined) {
        calculateSNVsGainedLost(JSON.stringify(demoFile));
        countSNVsPerSegment(JSON.stringify(demoFile));
        setIsDemo(true);
        // updateTree(JSON.stringify(demoFile));
      }
    }
  };

  return (
    <div className='full_container'>
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
        filteredJsonData={filteredJsonData}
        />
      </div>

      <div>
        <div id="cy" style={{ height: '70vh', marginLeft: '30%' }} ref={cyRef}></div>

        <div style={{ marginLeft: '40%' }} >
          <BarChart data={segmentData}/>
        </div>
      </div>

    </div>
  );
};

export default App;
