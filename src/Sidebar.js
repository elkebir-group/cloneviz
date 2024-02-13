import React, { useState } from 'react';
import "./Sidebar.css";

const Sidebar = ({ submitFile, fileChange, selectedFile }) => {

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
              <form onSubmit={submitFile}>
                <label title="Uploads your JSON tree.">
                  <input type="file" id="fileUpload" onChange={fileChange}/>
                  {selectedFile ? (
                    <p>Selected file: {selectedFile.name}</p>
                  ) : (
                    <p>Click Here to Upload File</p>
                  )}
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