import wallpaper from './img/wallpaper.webp';
import user_icon from './img/user-icon.jpeg';
import home_icon from './img/icon-home.png';
import about_icon from './img/icon-about.png';
import folder_icon from './img/icon-folder.ico';
import contact_icon from './img/icon-contact.png';
import notepad_icon from './img/icon-notepad.png';
import taskbar_start_icon from './img/icon-taskbar-start.jpeg';
import './App.css';
import emailjs from '@emailjs/browser';
import React from 'react';

const mainPrograms = [
  { name: 'Home', icon: home_icon, content: <HomePage />, width: '60vw', height: '70vh' },
  { name: 'About', icon: about_icon, content: <AboutPage />, width: '60vw', height: '70vh' },
  { name: 'Projects', icon: folder_icon, content: <ProjectsPage />, width: '60vw', height: '70vh' },
  { name: 'Contact', icon: contact_icon, content: <ContactPage />, width: '60vw', height: '70vh' },
  { name: 'Notepad', icon: notepad_icon, content: <Notepad />, width: '60vw', height: '70vh' },
];
const allPrograms = [
  { name: 'Home', icon: home_icon, content: <HomePage />, width: '60vw', height: '70vh' },
  { name: 'About', icon: about_icon, content: <AboutPage />, width: '60vw', height: '70vh' },
  { name: 'Projects', icon: folder_icon, content: <ProjectsPage />, width: '60vw', height: '70vh' },
  { name: 'Contact', icon: contact_icon, content: <ContactPage />, width: '60vw', height: '70vh' },
  { name: 'Notepad', icon: notepad_icon, content: <Notepad />, width: '60vw', height: '70vh' },
];

var openProgramGlobal;
var focusWindowGlobal;

function App() {
  const [processes, setProcesses] = React.useState([]);
  const [focus, setFocus] = React.useState({});

  function getMaxZIndex() { return Math.max(...processes.map(p => p.zIndex ? p.zIndex : 0)); }
  const openProgram = program => {
    const lastProgram = processes[processes.length - 1];
    const newId = lastProgram ? lastProgram.id + 1 : 0;
    const process = { ...program, name: program.name || newId, id: newId };
    setProcesses([...processes, process]);
  };
  const focusWindow = pId => {
    setProcesses(processes.map(p => p.id === pId ? { ...p, zIndex: getMaxZIndex() + 1 } : p));
  };
  const minimizeWindow = pId => {
    setProcesses(processes.map(p => p.id === pId ? { ...p, zIndex: p.zIndex < 0 ? getMaxZIndex() + 1 : -1 } : p));
  };
  const closeWindow = pId => {
    setProcesses(processes.filter(p => p.id !== pId));
  };

  openProgramGlobal = openProgram;
  focusWindowGlobal = focusWindow;

  React.useEffect(() => {
    const maxZIndex = getMaxZIndex();
    setFocus(processes.find(p => p.zIndex === maxZIndex));
  }, [processes]);

  return (
    <div className="App" style={{ backgroundImage: 'url("' + wallpaper + '")', backgroundSize: '100% 100%' }}>
      <div className='work-area'>
        <FloatingApps programs={allPrograms} />
        {
          processes.map(process => {
            return <Window key={process.id} process={process} focusWindow={focusWindow} minimizeWindow={minimizeWindow} closeWindow={closeWindow} focus={focus} />;
          })
        }
      </div>
      <Taskbar username={'Firsto'} processes={processes} />
    </div>
  );
}

function FloatingApps({ programs }) {
  return (
    <div className='floating-app-space'>
      {
        programs.map(program => {
          return <FloatingApp app={program} />;
        })
      }
    </div>
  );
}

function FloatingApp({ app }) {
  const clickHandler = () => openProgramGlobal(app);
  return <div className='floating-app' onDoubleClick={clickHandler}>
    <img className='floating-app-icon' src={app.icon} alt={app.name + ' icon'} />
    <span className='floating-app-label'>{app.name}</span>
  </div>;
}

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
        <hr />
        <h2 className='taskbar-menu-item taskbar-all-programs'>
          All programs ▶
          <div className='taskbar-all-programs-list'>
            {allPrograms.map(program => <TaskBarMenuButton program={program} />)}
          </div>
        </h2>
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

function TaskbarButton({ process }) {
  const handler = () => focusWindowGlobal(process.id);
  return <button className='taskbar-window' onClick={handler}>
    <img className='taskbar-window-icon' src={process.icon} alt={process.name + ' icon'} />
    {process.name}
  </button>;
}

function Window({ process, focusWindow, minimizeWindow, closeWindow, focus }) {
  React.useEffect(() => { console.log('test'); focusWindow(process.id) }, []);
  const [x, setX] = React.useState(Math.floor(Math.random() * 100));
  const [y, setY] = React.useState(Math.floor(Math.random() * 100));
  const [dx, setDx] = React.useState(0);
  const [dy, setDy] = React.useState(0);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const dragStartHandler = e => {
    focusWindow(process.id);
    setDx(e.clientX - x);
    setDy(e.clientY - y);
  };
  const touchStartHandler = e => {
    focusWindow(process.id);
    setDx(e.changedTouches[0].clientX - x);
    setDy(e.changedTouches[0].clientY - y);
  };
  const dragHandler = e => {
    setX(e.clientX - dx);
    setY(e.clientY - dy);
  };
  const touchMoveHandler = e => {
    setX(e.changedTouches[0].clientX - dx);
    setY(e.changedTouches[0].clientY - dy);
  };
  const dragEndHandler = e => e.preventDefault();
  const focusHandler = () => focusWindow(process.id);
  const minimizeHandler = () => minimizeWindow(process.id);
  const fullScreenHandler = () => setIsFullScreen(!isFullScreen);
  const closeHandler = () => closeWindow(process.id);

  return (
    <div className='window-container' style={{ top: isFullScreen ? 0 : y, left: isFullScreen ? 0 : x, width: isFullScreen ? '100%' : process.width, height: isFullScreen ? '100%' : process.height, zIndex: process.zIndex, display: process.zIndex < 0 && 'none' }}>
      <div className='window' style={{ position: 'relative', width: isFullScreen ? '100%' : process.width, height: isFullScreen ? '100%' : process.height, resize: !isFullScreen && 'both' }}>
        {process !== focus && <div onClick={focusHandler} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}></div>}
        <div className='window-header'>
          <div className='window-name' style={{ position: 'relative' }}>
            <div
              draggable={!isFullScreen ? 'true' : 'false'}
              onDragStart={dragStartHandler}
              onTouchStart={touchStartHandler}
              onDrag={dragHandler}
              onTouchMove={touchMoveHandler}
              onDragEnd={dragEndHandler}
              onDragOver={dragEndHandler}
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
  );
}

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

export default App;
