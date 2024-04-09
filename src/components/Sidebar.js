import React, { useState } from 'react';
import "./Sidebar.css";

const Sidebar = ({ onsubmitSelectedFile, onSelectFile, selectedFile, demoFiles, onSelectDemoFile, onSubmitDemoForm }) => {

  // const [jsonExportData, setJsonExportData] = useState(null);

  // Function to handle exporting JSON
  const handleExportJSON = () => {
    if (selectedFile) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const jsonData = event.target.result;
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
      
      reader.readAsText(selectedFile);
    }
  };
  
  return (

    <div
      className="sidebar"
      style={{
        width: "320px",
        left: 0
      }}
    >

      <div className="contents">
      <div className="row-contents"> <h1>CloneViz</h1> </div>
        <div className="title-bar"></div>

          <div className="row-contents" >
              <form onSubmit={onsubmitSelectedFile}>
                <label title="Uploads your JSON tree.">
                  <input type="file" id="fileUpload" onChange={onSelectFile}/>
                  {selectedFile ? (
                    <p>Selected file: {selectedFile.name}</p>
                  ) : (
                    <p>Click Here to Upload File</p>
                  )}
                </label>
                <button className="left-margin" type="submit">Submit</button>
                {/* Export JSON button */}
                <button className="left-margin" onClick={handleExportJSON}>Export JSON</button>
              </form>
          </div>

          <div className='row-contents' >
            <form onSubmit={onSubmitDemoForm}>
              {/* Dropdown for selecting demo files */}
              <label className="left-margin">
                  Select Demo File:
                  <select onChange={(e) => onSelectDemoFile(e.target.value)}>
                    <option value="">Select a demo file</option>
                    {demoFiles.map((demoFile) => (
                      <option key={demoFile.id} value={demoFile.id}>
                        {demoFile.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="left-margin" type="submit">Submit</button>
            </form>
          </div>

          <div className='row-contents'>
            <fieldset>
                <legend>Filter by:</legend>
                {/* Checkbox for "Segment" */}
                <div>
                  <label>
                      <input type="checkbox" name="segment" value="segment"/>
                      Segment
                  </label>
                </div>

                {/*  Checkbox for "SNVs" */}
                <div>
                  <label>
                      <input type="checkbox" name="snvs" value="snvs"/>
                      SNVs
                  </label>
                </div>

            </fieldset>
          </div>
              
      </div>
      
    </div>
  );
}

export default Sidebar;