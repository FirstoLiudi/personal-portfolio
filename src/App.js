import wallpaper from './wallpaper.webp';
import user_icon from './user-icon.jpeg';
import home_icon from './icon-home.png';
import about_icon from './icon-about.png';
import folder_icon from './icon-folder.ico';
import contact_icon from './icon-contact.png';
import notepad_icon from './icon-notepad.png';
import taskbar_start_icon from './icon-taskbar-start.jpeg'
import logo from './logo.svg';
import './App.css';
import React from 'react';

const mainPrograms = [
  { name: 'Home', icon: home_icon, content: <HomePage />, width: 300, height: 400 },
  { name: 'About', icon: about_icon, content: <AboutPage />, width: 300, height: 400 },
  { name: 'Projects', icon: folder_icon, content: <ProjectsPage />, width: 300, height: 400 },
  { name: 'Contact', icon: contact_icon, content: <ContactPage />, width: 300, height: 400 },
  { name: 'Notepad', icon: notepad_icon, content: <Notepad />, width: 300, height: 400 },
  { name: 'Test', icon: logo, content: <Test />, width: 300, height: 400 },
];
const allPrograms = [
  { name: 'Other Home', icon: home_icon, content: <HomePage />, width: 300, height: 400 },
  { name: 'Other About', icon: about_icon, content: <AboutPage />, width: 300, height: 400 },
  { name: 'Other Projects', icon: folder_icon, content: <ProjectsPage />, width: 300, height: 400 },
  { name: 'Other Contact', icon: contact_icon, content: <ContactPage />, width: 300, height: 400 },
  { name: 'Other Notepad', icon: notepad_icon, content: <Notepad />, width: 300, height: 400 },
  { name: 'Other Test', icon: logo, content: <Test />, width: 300, height: 400 },
];

let openProgramG;

function App() {
  const [processes, setProcesses] = React.useState([]);
  const [focus, setFocus] = React.useState({});
  const openProgram = program => {
    const lastProgram = processes[processes.length - 1];
    const newId = lastProgram ? lastProgram.id + 1 : 0;
    const process = { ...program, name: program.name || newId, id: newId }
    setProcesses([...processes, process]);
  };
  openProgramG = openProgram;
  function getMaxZIndex() { return Math.max(...processes.map(p => p.zIndex ? p.zIndex : 0)); }
  const focusWindow = pId => {
    setProcesses(processes.map(p => p.id === pId ? { ...p, zIndex: getMaxZIndex() + 1 } : p));
  };
  const toggleMinimizeWindow = pId => {
    setProcesses(processes.map(p => p.id === pId ? { ...p, zIndex: p.zIndex < 0 ? getMaxZIndex() + 1 : -1 } : p));
  };
  const closeWindow = pId => {
    setProcesses(processes.filter(p => p.id != pId));
  };
  React.useEffect(() => {
    const maxZIndex = getMaxZIndex();
    setFocus(processes.find(p => p.zIndex === maxZIndex));
  }, [processes]);
  return (
    <div className="App" style={{ backgroundImage: 'url("' + wallpaper + '")', backgroundSize: '100% 100%' }}>
      <div className='work-area'>
        <div className='floating-app-space'>
          {
            mainPrograms.map(program => {
              return (
                <div className='floating-app' onDoubleClick={() => openProgram(program)}>
                  <img className='floating-app-icon' src={program.icon} />
                  <span className='floating-app-label'>{program.name}</span>
                </div>
              );
            })
          }
        </div>
        {
          processes.map(process => {
            return <Window key={process.id} process={process} focusWindow={focusWindow} toggleMinimizeWindow={toggleMinimizeWindow} closeWindow={closeWindow} focus={focus} />;
          })
        }
      </div>
      <Taskbar username={'Firsto'} processes={processes} focusWindow={focusWindow} toggleMinimizeWindow={toggleMinimizeWindow} />
    </div>
  );
}

function Taskbar({ username, processes, toggleMinimizeWindow, focusWindow }) {
  return <div className='taskbar'>
    <TaskbarMenu username={username} />
    <div className='taskbar-window-list'>
      {
        processes.map(process => {
          return <TaskbarButton process={process} focusWindow={focusWindow} toggleMinimizeWindow={toggleMinimizeWindow} />
        })
      }
    </div>
  </div>;
}

function TaskbarMenu({ username }) {
  // const [showMenu, setShowMenu] = React.useState(false);
  // const mouseLeaveHandler = () => { setShowMenu(false); }
  // const mouseOverHandler = () => { setShowMenu(true); }
  return (<div className='taskbar-start-menu'>
    <img className='taskbar-start' src={taskbar_start_icon} />
    <div className='taskbar-menu'>
      <div className='taskbar-menu-user'>
        <img src={user_icon} className='taskbar-menu-user-icon' />
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
  const handler = () => openProgramG(program);
  return (<div className='taskbar-menu-item'>
    <img className='taskbar-menu-item-icon' src={program.icon} />
    <h2 className='taskbar-menu-item-label' onClick={handler}>{program.name}</h2>
  </div>);
}

function TaskbarButton({ process, focusWindow, toggleMinimizeWindow }) {
  const handler = () => focusWindow(process.id);
  return <button className='taskbar-window' onClick={handler}>
    <img className='taskbar-window-icon' src={process.icon} />
    {process.name}
  </button>;
}

function Window({ process, focusWindow, toggleMinimizeWindow, closeWindow, focus }) {
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
  const minimizeHandler = () => toggleMinimizeWindow(process.id);
  const fullScreenHandler = () => setIsFullScreen(!isFullScreen);
  const closeHandler = () => closeWindow(process.id);

  return (
    <div className='window-container' style={{ top: isFullScreen ? 0 : y, left: isFullScreen ? 0 : x, width: isFullScreen ? '100%' : process.width, height: isFullScreen ? '100%' : process.height, zIndex: process.zIndex, display: process.zIndex < 0 && 'none' }}>
      <div className='window' style={{ position: 'relative', width: isFullScreen ? '100%' : process.width, height: isFullScreen ? '100%' : process.height, resize: !isFullScreen && 'both' }}>
        {process != focus && <div onClick={focusHandler} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}></div>}
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
            <img className='window-icon' src={process.icon} />
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
  const [name, setName] = React.useState('');
  const [comment, setComment] = React.useState('');
  const formHandler = e => {
    e.preventDefault();
    console.log(e);
  }
  const nameHandler = e => {
    setName(e.target.value);
    console.log(name);
  }
  const commentHandler = e => {
    setComment(e.target.value);
    console.log(comment);
  }
  return (<div style={{ padding: 10 }}>
    <h1>Contact Me By</h1>
    <div className='contact-main'>
      <div className='contact-info-container'>
        <h2>My Contact Info:</h2>
        <p>My email is liudi.firsto@gmail.com.</p>
        <p>PUT LINKS TO linkedIn, gitHub...</p>
      </div>
      <div className='contact-form-container'>
        <h2>Or send a message to me:</h2>
        <form className='contact-form' onSubmit={formHandler}>
          <label>Send a request</label>
          <input className='contact-name' style={{ width: '100%' }} placeholder='Your name' onChange={nameHandler}></input>
          <textarea className='contact-comment' style={{ width: '100%', resize: 'none' }} placeholder='Your request comment' onChange={commentHandler}></textarea>
          <button style={{ alignSelf: 'start' }}>Submit</button>
        </form>
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
function Test() {
  const array = [1, 2, 3, 4, 5, 6];
  var target, animationEndTarget;
  const clickHandler = event => {
    if (target) target.parentElement.classList.remove('card-clicked');
    target = event.target;
    event.target.parentElement.classList.add('card-clicked');
  }
  const animationEndHandler = event => {
    if (animationEndTarget) animationEndTarget.classList.remove('test');
    animationEndTarget = event.target;
    event.target.classList.add('test');
  }
  return (
    <div>
      <Deck array={array} clickHandler={clickHandler} animationEndHandler={animationEndHandler} />
    </div>
  );
}

function Deck({ array, clickHandler, animationEndHandler }) {
  return <div className='deck'>
    {array.map((v, i, a) => {
      return (
        <Card
          name={v}
          description={'This is a card...'}
          zIndex={a.length - i}
          clickHandler={clickHandler}
          animationEndHandler={animationEndHandler} />
      );
    })}
  </div>;
}

function Card({ name, description, clickHandler, animationEndHandler, zIndex }) {
  // const h=event=>{event.target.classList.add('test');}
  return (
    <div style={{ zIndex: zIndex }} className='card-container' onAnimationEnd={animationEndHandler}>
      <div className='card-click-area' onClick={clickHandler}></div>
      <div className='card'>
        <h1>{name}</h1>
        <p className='card-description'>
          {description}
        </p>
      </div>
    </div>
  );
}

export default App;
