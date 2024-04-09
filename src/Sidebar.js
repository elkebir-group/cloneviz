import React, { useState } from 'react';
import "./Sidebar.css";

const Sidebar = ({ selectedFile, handleSegmentFilterCheckboxChange, handleSelectChange, segmentFilterChecked, selectedSegment, handleSNVFilter, snvCheckboxChecked, setSNVCheckboxChecked, setSNVId, onsubmitSelectedFile, onSelectFile, demoFiles, onSelectDemoFile, onSubmitDemoForm, filteredJsonData }) => {
  const [snvInput, setSNVInput] = useState('');

  const handleSNVInputChange = (event) => {
    setSNVInput(event.target.value);
    setSNVId(event.target.value); // Update snvId state
  }

  const toggleSNVCheckbox = () => {
    setSNVCheckboxChecked(!snvCheckboxChecked); // Toggle checkbox state
  }

  const handleFilterClick = () => {
    handleSNVFilter(); // Call the parent component's filter function
  }
  // const [jsonExportData, setJsonExportData] = useState(null);

  // Function to handle exporting JSON
  const handleExportJSON = () => {
    if (selectedFile && filteredJsonData) {
      // Convert JSON data to string
      const jsonString = JSON.stringify(filteredJsonData);
  
      // Create a Blob object with the JSON string
      const blob = new Blob([jsonString], { type: 'application/json' });
  
      // Create a FileReader
      const reader = new FileReader();
  
      // Define onload event handler
      reader.onload = (event) => {
        // Once loaded, create a temporary URL for the Blob object
        const url = URL.createObjectURL(blob);
  
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name; // Set the filename
        document.body.appendChild(a);
  
        // Trigger a click event on the anchor element to start downloading
        a.click();
  
        // Cleanup: remove the anchor element and revoke the URL
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
  
      // Read the Blob object as text
      reader.readAsText(blob);
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
                    <input type="checkbox" name="segment" value="segment" onChange={handleSegmentFilterCheckboxChange} checked={segmentFilterChecked}/>
                    Segment
                    </label>
                    {/* Dropdown for segment selection */}
                    <select value={selectedSegment} onChange={handleSelectChange}>
                      {[...Array(50).keys()].map((segment) => (
                        <option key={segment} value={segment}>{segment}</option>
                      ))}
                    </select>
                </div>

                {/* Checkbox and input for "SNVs" */}
                <div>
                  <label>
                    <input type="checkbox" name="snvs" value="snvs" onChange={toggleSNVCheckbox} checked={snvCheckboxChecked} />
                    SNVs
                  </label>
                  <input type="number" placeholder="SNV ID" value={snvInput} onChange={handleSNVInputChange} />
                </div>
              {/* Submit button */}
              <button className="left-margin" onClick={handleFilterClick}>Filter</button>
            </fieldset>
          </div>
              
      </div>
      
    </div>
  );
}

export default Sidebar;