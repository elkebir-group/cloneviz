import React from 'react';
import "./Sidebar.css";

const Sidebar = ({ submitFile, fileChange }) => {

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
                    Click to Upload File
                </label>
                <button type="submit">Submit</button>
              </form>
          </div>

          <div className='row-contents'>
            
          </div>
              
      </div>
      
    </div>
  );
}

export default Sidebar;