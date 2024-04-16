import React, { useRef, useState, useEffect } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import Sidebar from './components/Sidebar';
import demoFile1 from './demo_json/s11_m5000_k25_l7_n1000_c0.25_e0.json';
import demoFile2 from './demo_json/s14_m5000_k25_l7_n1000_c0.25_e0.json';
import 'cytoscape-qtip';
import BarChart from './components/BarChart';
import popper from 'cytoscape-popper';
import { createPopper } from '@popperjs/core'; // Import Popper.js for positioning
import tippy from 'tippy.js'; // Import Tippy.js for tooltips

import { Button } from 'semantic-ui-react';

cytoscape.use(dagre);
cytoscape.use(popper);

const App = () => {
  const cyRef = useRef(null);
  const cyPopperRef = useRef(null);
  const [file, setFile] = useState();
  const [demoFile, setDemoFile] = useState();
  const [segmentData, setSegmentData] = useState({});
  const [countSNVData, setCountSNVData] = useState({});
  const [isDemo, setIsDemo] = useState(false);

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
          if (delta_x > 0) {
            snvCounts[child_id]["snvs_gained"] += delta_x;
          }
          if (delta_x < 0) {
            snvCounts[child_id]["snvs_lost"] += (-1 * delta_x);
          }
          if (delta_y > 0) {
            snvCounts[child_id]["snvs_gained"] += delta_y;
          }
          if (delta_y < 0) {
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

  function updateTree(jsonFile) {
    try {
      const jsonData = JSON.parse(jsonFile);
  
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
      return `SNVs Gained: ${nodeData.snvs_gained} SNVs Lost: ${nodeData.snvs_lost}`;
    } else {
      return `Node ID: ${node.node_id}`;
    }
  }  
  

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
        <Sidebar onsubmitSelectedFile={handleSubmit} onSelectFile={handleChange} selectedFile={file} demoFiles={demoFiles} onSelectDemoFile={handleSelectDemoFile} onSubmitDemoForm={handleSubmitDemoFile}/>
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
