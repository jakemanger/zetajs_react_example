'use client'
import React, { useEffect, useState } from 'react';

export default function Soffice() {
  const [moduleLoaded, setModuleLoaded] = useState(false);
  const [fileInputDisabled, setFileInputDisabled] = useState(true);

  useEffect(() => {
    const canvas = document.getElementById('qtcanvas');

    const mainPrefix = 'https://cdn.zetaoffice.net/zetaoffice_latest/';
    // const mainPrefix = '/';

    const loadWasmAndScript = async () => {
      try {
        window.Module = {
          canvas,
          uno_scripts: ['./zeta.js', './office_thread.js'],
          locateFile: (path, prefix) => {
            console.log('Locating file:', path);
            console.log('Prefix:', mainPrefix);
            return `${mainPrefix || '/'}${path}`;
          },
          onRuntimeInitialized: () => {
            console.log('WASM and runtime initialized.');
            setFileInputDisabled(false); // Enable file input once runtime is ready
          },
          print: (message) => console.log(message),
          printErr: (message) => console.error(message),
        };

        const script = document.createElement('script');
        script.src = '/soffice.js';
        script.onload = () => {
          console.log('soffice.js script loaded.');
          console.log('FS:', window.FS);
        };
        script.onerror = () => {
          console.error('Failed to load soffice.js');
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading resources:', error);
      }
    };

    if (!moduleLoaded) {
      loadWasmAndScript();
      setModuleLoaded(true);
    }
  }, [moduleLoaded]);

  const handleFileInput = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileInputDisabled(true);

    try {
      const port = await window.Module.uno_main;
      console.log('Obtained port:', port);
      const fileName = file.name;
      const extension = fileName.split('.').pop() || '';
      const filePath = `/tmp/input.${extension}`;
      const outputPath = '/tmp/output';

      console.log('Writing file to:', filePath);
      const fileData = new Uint8Array(await file.arrayBuffer());
      window.FS.writeFile(filePath, fileData);

      console.log('Posting convert message to port:', { cmd: 'convert', name: fileName, from: filePath, to: outputPath });
      port.postMessage({ cmd: 'convert', name: fileName, from: filePath, to: outputPath });

      port.onmessage = (e) => {
        console.log('Received message:', e.data);
        switch (e.data.cmd) {
          case 'converted':
            try {
              const outputData = window.FS.readFile(outputPath);
              const blob = new Blob([outputData], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              const iframe = document.getElementById('frame');
              iframe.contentWindow.location.replace(url);

              const downloadCheckbox = document.getElementById('download');
              if (downloadCheckbox.checked) {
                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileName}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }

              URL.revokeObjectURL(url);
              window.FS.unlink(filePath);
              window.FS.unlink(outputPath);
              console.log('File conversion and handling completed.');
            } catch (error) {
              console.error('Error during file handling:', error);
            }
            setFileInputDisabled(false);
            break;

          case 'start':
            setFileInputDisabled(false);
            break;

          default:
            console.error('Unknown command:', e.data.cmd);
            setFileInputDisabled(false);
            break;
        }
      };
    } catch (error) {
      console.error('Error handling file input:', error);
      setFileInputDisabled(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        id="input"
        disabled={fileInputDisabled}
        onChange={handleFileInput}
      />
      <label>
        <input type="checkbox" id="download" /> Download
      </label>
      <iframe
        id="frame"
        style={{
          height: '90vh',
          width: '100vw',
        }}
      ></iframe>
      <canvas id="qtcanvas" style={{ display: 'none' }}></canvas>
    </div>
  );
}
