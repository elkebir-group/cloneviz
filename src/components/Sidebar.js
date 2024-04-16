import React, { useState } from 'react';
import "./Sidebar.css";

const Sidebar = ({ selectedFile, handleSegmentFilterCheckboxChange, handleSelectChange, segmentFilterChecked, selectedSegment, handleSNVFilter, snvCheckboxChecked, setSNVCheckboxChecked, setSNVId, onsubmitSelectedFile, onSelectFile, demoFiles, onSelectDemoFile, onSubmitDemoForm, filteredJsonData }) => {
  const [snvInput, setSNVInput] = useState('');

  const handleSNVInputChange = (event) => {
    setSNVInput(event.target.value);
  }

  const toggleSNVCheckbox = () => {
    setSNVCheckboxChecked(!snvCheckboxChecked); // Toggle checkbox state
  }

  const handleFilterClick = () => {
    const snvIds = snvInput.split(',').map(id => parseInt(id.trim())); // Parse input into array of SNV IDs
    handleSNVFilter(snvIds); // Call the parent component's filter function with SNV IDs
  }

  // Function to handle exporting JSON
  const handleExportJSON = () => {
    if (selectedFile && filteredJsonData) {
      const jsonString = JSON.stringify(filteredJsonData);
  
      const blob = new Blob([jsonString], { type: 'application/json' });
  
      const reader = new FileReader();
  
      reader.onload = (event) => {
        const url = URL.createObjectURL(blob);
  
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name;
        document.body.appendChild(a);
  
        a.click();
  
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
  
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
        <div className="row-contents">
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
            <button className="left-margin" onClick={handleExportJSON}>Export JSON</button>
          </form>
        </div>

        <div className='row-contents' >
          <form onSubmit={onSubmitDemoForm}>
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
            <div>
              <label>
                <input type="checkbox" name="segment" value="segment" onChange={handleSegmentFilterCheckboxChange} checked={segmentFilterChecked}/>
                Segment
              </label>
              <select value={selectedSegment} onChange={handleSelectChange}>
                {[...Array(50).keys()].map((segment) => (
                  <option key={segment} value={segment}>{segment}</option>
                ))}
              </select>
            </div>

            <div>
              <label>
                <input type="checkbox" name="snvs" value="snvs" onChange={toggleSNVCheckbox} checked={snvCheckboxChecked} />
                SNVs
              </label>
              <input type="text" placeholder="SNV IDs (comma-separated)" value={snvInput} onChange={handleSNVInputChange} />
            </div>
            <button className="left-margin" onClick={handleFilterClick}>Filter</button>
          </fieldset>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
