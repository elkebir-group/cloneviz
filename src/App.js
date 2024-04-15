import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import Sidebar from './components/Sidebar';
import demoFile1 from './demo_json/s11_m5000_k25_l7_n1000_c0.25_e0.json';
import demoFile2 from './demo_json/s14_m5000_k25_l7_n1000_c0.25_e0.json';
import 'cytoscape-qtip';
import BarChart from './components/BarChart';
import popper from 'cytoscape-popper';

import { Button } from 'semantic-ui-react';

cytoscape.use(dagre);
cytoscape.use(popper);

const ReactButton = () => {
  return <Button type="button">React Button</Button>;
};

const createContentFromComponent = (component) => {
  const dummyDomEle = document.createElement('div');
  ReactDOM.render(component, dummyDomEle);
  document.body.appendChild(dummyDomEle);
  return dummyDomEle;
};

const App = () => {
  const cyRef = useRef(null);
  const cyPopperRef = useRef(null);
  const [file, setFile] = useState();
  const [demoFile, setDemoFile] = useState();
  const [segmentData, setSegmentData] = useState({});

  // const segmentData = {};

  function countSNVs(jsonFile) {
    try {
      const jsonData = JSON.parse(jsonFile);
      console.log("RECOUNTING SNVS");

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

      console.log("updated segmentData: " + JSON.stringify(updatedSegmentData));
      setSegmentData(updatedSegmentData); // Update segmentData state

    } catch (error) {
      console.error('Error loading JSON:', error);
    }
  }

  function updateTree(jsonFile) {
    try {
      const jsonData = JSON.parse(jsonFile);
      // console.log("UPDATE snvs: " + JSON.stringify(jsonData));
  
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

      cy.nodes().on('mouseover', (event) => {
        console.log("HOVERING!");
      });
  
    } catch (error) {
      console.error('Error loading JSON:', error);
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
          updateTree(result);
          countSNVs(result);
        })
      }
    }
  };

  function handleSubmitDemoFile(event) {
    if (event !== undefined) {
      event.preventDefault()
      if (demoFile !== undefined) {
        updateTree(JSON.stringify(demoFile));
        countSNVs(JSON.stringify(demoFile));
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
