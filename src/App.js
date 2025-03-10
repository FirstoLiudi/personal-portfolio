import user_icon from './img/user-icon.jpeg';
import home_icon from './img/icon-home.png';
import about_icon from './img/icon-about.png';
import folder_icon from './img/icon-folder.ico';
import contact_icon from './img/icon-contact.png';
import internet_explorer_icon from './img/icon-internet-explorer.png';
import notepad_icon from './img/icon-notepad.png';
import taskbar_start_icon from './img/icon-taskbar-start.jpeg';
import './App.css';
import emailjs from '@emailjs/browser';
import React from 'react';
import Iframe from 'react-iframe';
import Draggable from 'react-draggable';

// the programs that is shown in the start menu
const mainPrograms = [
  { name: 'Home', icon: home_icon, content: <HomePage /> },
  { name: 'About', icon: about_icon, content: <AboutPage /> },
  { name: 'Projects', icon: folder_icon, content: <ProjectsPage /> },
  { name: 'Contact', icon: contact_icon, content: <ContactPage /> },
  { name: 'Internet Explorer', icon: internet_explorer_icon, content: <InternetExplorer /> },
];
// all programs that will be shown in desktop and all programs
const allPrograms = [
  ...mainPrograms,
  { name: 'Notepad', icon: notepad_icon, content: <Notepad /> },
];

// functions for open/focus/minimize/close windows (defined in App component)
var openProgramGlobal;
var focusWindowGlobal;
var minimizeWindowGlobal;
var closeWindowGlobal;

function App() {
  // The array of running programs/windows
  const [processes, setProcesses] = React.useState([]);
  // The top most window
  const [focus, setFocus] = React.useState({});

  // returns the biggest z-index of the windows
  function getMaxZIndex(processes) { return Math.max(...processes.map(p => p.zIndex ? p.zIndex : 0)); }

  // functions for open/focus/minimize/close windows
  const openProgram = program => {
    const lastProgram = processes[processes.length - 1];
    const newId = lastProgram ? lastProgram.id + 1 : 0;
    const process = { ...program, id: newId };
    setProcesses([...processes, process]);
  };
  const focusWindow = pId => {
    setProcesses(processes.map(p => p.id === pId ? { ...p, zIndex: getMaxZIndex(processes) + 1 } : p));
  };
  const minimizeWindow = pId => {
    setProcesses(processes.map(p => p.id === pId ? { ...p, zIndex: -1 } : p));
  };
  const closeWindow = pId => {
    setProcesses(processes.filter(p => p.id !== pId));
  };

  // passing the functions above to global variable (for easy access for other components)
  openProgramGlobal = openProgram;
  focusWindowGlobal = focusWindow;
  minimizeWindowGlobal = minimizeWindow;
  closeWindowGlobal = closeWindow;

  // updates the focus window when a window is opened/closed/minimized
  React.useEffect(() => {
    const maxZIndex = getMaxZIndex(processes);
    setFocus(processes.find(p => p.zIndex === maxZIndex));
  }, [processes]);

  return (
    <div className="App">
      <div className='work-area'>
        <div className='desktop-icon-space'>
          {allPrograms.map(program => <DesktopIcon program={program} />)}
        </div>
        {
          processes.map(process =>
            <Window key={process.id} process={process} focus={focus} />
          )
        }
      </div>
      <Taskbar username={'Firsto'} processes={processes} />
    </div>
  );
}

// The floating icon in the desktop
function DesktopIcon({ program }) {
  const clickHandler = () => openProgramGlobal(program);
  return <div className='desktop-icon' onDoubleClick={clickHandler}>
    <img className='desktop-icon-icon' src={program.icon} alt={program.name + ' icon'} />
    <span className='desktop-icon-label'>{program.name}</span>
  </div>;
}

function Window({ process, focus }) {
  React.useEffect(() => focusWindowGlobal(process.id), [process.id]);
  // the width/height of the window
  const [w, setW] = React.useState(null);
  const [h, setH] = React.useState(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const resizeHandler = e => {
    setW(e.changedTouches[0].clientX);
    setH(e.changedTouches[0].clientY);
  }
  const focusHandler = () => focusWindowGlobal(process.id);
  const minimizeHandler = () => minimizeWindowGlobal(process.id);
  const fullScreenHandler = () => setIsFullScreen(!isFullScreen);
  const closeHandler = () => closeWindowGlobal(process.id);

  const [isDraggable, setIsDraggable] = React.useState(false);
  return (
    <Draggable disabled={isFullScreen || !isDraggable} position={isFullScreen && {y: 0, x: 0}}>
    <div className='window-container' style={{ top: 0, left: 0, width: isFullScreen && '100%', height: isFullScreen && '100%', zIndex: process.zIndex, display: process.zIndex < 0 && 'none' }}>
      <div className='window' style={{ position: 'relative', width: isFullScreen ? '100%' : w, height: isFullScreen ? '100%' : h, resize: !isFullScreen && 'both' }}>
        {process !== focus && <div onClick={focusHandler} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}></div>}
        <div onTouchMove={resizeHandler} style={{ position: 'absolute', bottom: 0, right: 0, height: 20, width: 20 }}></div>
        <div className='window-header'>
          <div className='window-name' style={{ position: 'relative' }}>
            <div
              // draggable={!isFullScreen ? 'true' : 'false'}
              // onDragStart={dragStartHandler}
              // onTouchStart={dragStartMobileHandler}
              // onDrag={dragHandler}
              // onTouchMove={dragMobileHandler}
              // onDragEnd={dragEndHandler}
              // onDragOver={dragEndHandler}
              
              onMouseEnter={() => {setIsDraggable(true)}}
              onMouseDown={()=>focusWindowGlobal(process.id)}
              onMouseLeave={() => {setIsDraggable(false)}}
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            ></div>
            <img className='window-icon' src={process.icon} alt={process.name + ' icon'} />
            <span className='window-name'>{process.name}</span>
          </div>
          <button className='window-button' onClick={minimizeHandler}>_</button>
          <button className='window-button' onClick={fullScreenHandler}>■</button>
          <button className='window-close-button' onClick={closeHandler}>x</button>
        </div>
        <div className='window-main'>{process.content}</div>
      </div>
    </div>
    </Draggable>
  );
}

// The bottom bar containing the start menu and tabs
function Taskbar({ username, processes }) {
  return <div className='taskbar'>
    <TaskbarMenu username={username} />
    <div className='taskbar-window-list'>
      {
        processes.map(process => {
          return <TaskbarButton process={process} />
        })
      }
    </div>
    <TaskbarClock />
  </div>;
}

// A clock displaying the time
function TaskbarClock() {
  function getCurrentTime() {
    const date = new Date();
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${h % 12}:${m}:${s} ${h < 12 ? 'AM' : 'PM'}`;
  }
  const [time, setTime] = React.useState(getCurrentTime());
  React.useEffect(() => {
    setInterval(() => setTime(getCurrentTime), 1000);
  }, []);
  return (
    <div className='taskbar-clock'>
      <span>{time}</span>
    </div>
  );
}

// The start menu
function TaskbarMenu({ username }) {
  return (<div className='taskbar-start-menu'>
    <img className='taskbar-start' src={taskbar_start_icon} alt='start button' />
    <div className='taskbar-menu'>
      <div className='taskbar-menu-user'>
        <img src={user_icon} className='taskbar-menu-user-icon' alt='user icon' />
        <h2 className='taskbar-menu-user-name'>{username}</h2>
      </div>
      <div className='taskbar-menu-list'>
        {mainPrograms.map(program => <TaskBarMenuButton program={program} />)}
        <hr className='taskbar-menu-line' />
        <div className='taskbar-all-programs'>
          <h2>All programs ▶</h2>
          <div className='taskbar-all-programs-list'>
            {allPrograms.map(program => <TaskBarMenuButton program={program} />)}
          </div>
        </div>
      </div>
    </div>
  </div>);
}

function TaskBarMenuButton({ program }) {
  const handler = () => openProgramGlobal(program);
  return (<div className='taskbar-menu-item'>
    <img className='taskbar-menu-item-icon' src={program.icon} alt={program.name + ' icon'} />
    <h2 className='taskbar-menu-item-label' onClick={handler}>{program.name}</h2>
  </div>);
}

// The window tabs to unminimize the window
function TaskbarButton({ process }) {
  const handler = () => focusWindowGlobal(process.id);
  return <button className='taskbar-window' onClick={handler}>
    <img className='taskbar-window-icon' src={process.icon} alt={process.name + ' icon'} />
    {process.name}
  </button>;
}

// Below are the program's contents

function HomePage() {
  return (<div style={{ padding: 10 }}>
    <h1>Hello</h1>
    <p>Welcome to my personal portfolio.</p>
  </div>);
}
function AboutPage() {
  return (<div style={{ padding: 10 }}>
    <h1>Myself</h1>
    <p>My name is Firsto, I am a student.</p>
  </div>);
}
function ProjectsPage() {
  return (<div style={{ padding: 10 }}>
    <h1>Projects</h1>
    <p>There is not much yet...</p>
  </div>);
}
function ContactPage() {
  const [responseStatus, setResponseStatus] = React.useState({ pending: false, msg: "", color: "black" });
  const formHandler = e => {
    e.preventDefault();
    setResponseStatus({ pending: true, msg: "Sending your request...", color: "grey" });
    // using emailjs API to send me email (email details such as it's reciever are defined in the emailjs website)
    emailjs
      .sendForm('service_ggdcnj8', 'template_of1jj36', e.target, {
        publicKey: 'giDAa8XFsxbR1cnKr',
      })
      .then(
        () => {
          setResponseStatus({ pending: false, msg: "Your request has been sent!", color: "green" });
        },
        (error) => {
          setResponseStatus({ pending: false, msg: "Error! There is a problem in sending your request", color: "red" });
        },
      );
  }
  return (<div style={{ padding: 20 }}>
    <h1>Contact Me By</h1>
    <div className='contact-main'>
      <div className='contact-info-container'>
        <h2>My Contact Info:</h2>
        <p>My email is liudi.firsto@gmail.com.</p>
        <p>PUT LINKS TO linkedIn, gitHub...</p>
      </div>
      <div className='contact-form-container'>
        <h2>Or send a request from here:</h2>
        <form className='contact-form' onSubmit={formHandler}>
          <label>Send a request</label>
          <input required name='from_name' className='contact-name' style={{ width: '100%' }} placeholder='Your name'></input>
          <textarea required name='message' className='contact-comment' style={{ width: '100%', resize: 'none' }} placeholder='Your request comment'></textarea>
          <button disabled={responseStatus.pending} style={{ alignSelf: 'start' }}>Submit</button>
        </form>
        <p style={{ color: responseStatus.color }}>{responseStatus.msg}</p>
      </div>
    </div>
  </div>);
}

function Notepad() {
  return (<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
    <div style={{ width: '100%', display: 'flex', gap: 10 }}>
      <span>File</span>
      <span>Edit</span>
      <span>Format</span>
      <span>View</span>
      <span>Help</span>
    </div>
    <textarea style={{ flexGrow: 1, resize: 'none' }}></textarea>
  </div>);
}

function InternetExplorer() {
  const [url, setUrl] = React.useState('');
  const goToWebsite = e => {
    e.preventDefault();
    const url = new FormData(e.target).get('url');
    // Check url format (because Iframe needs 'http://' in front of the url)
    if (url.includes('https://') || url.includes('http://')) setUrl(url);
    else setUrl('https://'+url);
  }
  // Iframe: a component that can view the website of the given url
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <form onSubmit={goToWebsite} style={{ display: 'flex' }}>
        <input name='url' placeholder='Enter website address' style={{ flex: '1 1', minWidth: 0 }} />
        <button>Go</button>
      </form>
      <Iframe url={url} styles={{ flexGrow: 1, overflowY: 'scroll' }} />
    </div>
  );
}

export default App;
