import React, { useEffect } from 'react';
import Ping from 'ping.js'; // Ensure this import works properly

const Soffice = () => {
  useEffect(() => {
    const loadScript = (src, callback) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = callback;
      document.body.appendChild(script);
    };

    loadScript('./pre_soffice.js', () => {
      try {
        if (!window.PingModule) {
          window.PingModule = Ping; // Assign imported Ping module only if not already set
        }
      } catch (err) {
        console.error('Error initializing PingModule:', err);
      }
    });
  }, []);

  return (
    <div id="app">
      <table style={{ width: '1150px', borderSpacing: '10px' }}>
        <tbody>
          <tr>
            <td>
              <div>
                <h1>ZetaJS Calc Demo</h1>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div
                onMouseDown={(e) => e.preventDefault()} // Replacing onSelectStart
                style={{ position: 'relative' }}
              >
                <div
                  id="loadingInfo"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="spinner"></div>
                  <br />
                  <h2>ZetaOffice is loading...</h2>
                </div>
                <canvas
                  id="qtcanvas"
                  contentEditable="true"
                  onContextMenu={(e) => e.preventDefault()}
                  onKeyDown={(e) => e.preventDefault()}
                  width="900px"
                  height="450px"
                  style={{
                    border: 'none',
                    padding: '0',
                    outline: '1px solid #cccccc',
                  }}
                />
              </div>
            </td>
            <td style={{ verticalAlign: 'top', width: '250px' }}>
              <div>
                <button onClick={() => console.log('Ping button clicked!')}>
                  Ping
                </button>
                &nbsp;
                <input
                  type="text"
                  id="ping_target"
                  name="ping_target"
                  defaultValue="https://zetaoffice.net/"
                />
              </div>
              <div>
                <span id="ping_section">Loading ping tool...</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Soffice;
