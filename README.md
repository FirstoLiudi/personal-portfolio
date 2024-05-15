
# My Personal Portfolio

A website that tries to imitate Windows XP desktop

## Features
- Windows XP desktop features such as
	- Open/Close/Fullscreen/Minimize/Resize windows
	- Windows XP navigation (desktop icons, taskbar, menu)
- Some imitations of Windows XP apps (not much currently, more coming soon)
- A contact page (in the form of a window) to send a request to me

## Technologies Used
- React
	- external libraries: emailjs and react-iframe
- CSS

## Components
### App
- Represents the desktop and the operating system
- States
	- processes (Array)
		- An array of windows that are currently open (because a running program is called a process)
		- The program (before running it into a process) are objects that are like in the mainPrograms (a global const) list below, where each program has their own component (in the content property).
	- focus (one of the process in processes)
		- The window that is currently focused
```
function App() {
  const [processes, setProcesses] = React.useState([]);
  const [focus, setFocus] = React.useState({});
```
```
const mainPrograms = [
  { name: 'Home', icon: home_icon, content: <HomePage /> },
  { name: 'About', icon: about_icon, content: <AboutPage /> },
  { name: 'Projects', icon: folder_icon, content: <ProjectsPage /> },
  { name: 'Contact', icon: contact_icon, content: <ContactPage /> },
  { name: 'Internet Explorer', icon: internet_explorer_icon, content: <InternetExplorer /> },
];
```
- Functions
	- openProgram
		- to open the program by assigning a process ID and pushing it to the processes array
	- focusWindow, minimizeWindow, closeWindow
		- to focus, minimize and close the window
		- note: focus means making the window placed above other windows
		- this is done by manipulating the z-index and processes array, which is why it's declared here (the same scope as the processes array)
		- these 4 functions above are passed to global variables (openProgramGlobal, focusWindowGlobal, minimizeWindowGlobal, closeWindowGlobal) for easy access
	- getMaxZIndex
		- to get the window (process in the processes array) with the biggest z-index (for the operations above)
	- useEffect on processes array
		- to find the window with the biggest z-index and focus it when there is a change in the processes array
```
  function getMaxZIndex() { return Math.max(...processes.map(p => p.zIndex ? p.zIndex : 0)); }
  const openProgram = program => {
    const lastProgram = processes[processes.length - 1];
    const newId = lastProgram ? lastProgram.id + 1 : 0;
    const process = { ...program, id: newId };
    setProcesses([...processes, process]);
  };
  const focusWindow = pId => {
    setProcesses(processes.map(p => p.id === pId ? { ...p, zIndex: getMaxZIndex() + 1 } : p));
  };
  const minimizeWindow = pId => {
    setProcesses(processes.map(p => p.id === pId ? { ...p, zIndex: -1 } : p));
  };
  const closeWindow = pId => {
    setProcesses(processes.filter(p => p.id !== pId));
  };

  openProgramGlobal = openProgram;
  focusWindowGlobal = focusWindow;
  minimizeWindowGlobal = minimizeWindow;
  closeWindowGlobal = closeWindow;
  
  React.useEffect(() => {
    const maxZIndex = getMaxZIndex();
    setFocus(processes.find(p => p.zIndex === maxZIndex));
  }, [processes]);
```
- The HTML part
	- contains the collection of windows, floating apps and the taskbar
	- allPrograms is a list of all the programs, currently a const
```
  return (
    <div className="App">
      <div className='work-area'>
        <div className='floating-app-space'>
          {allPrograms.map(program => <FloatingApp app={program} />)}
        </div>
        {
          processes.map(process =>
            <Window key={process.id} process={process} focusWindow={focusWindow} minimizeWindow={minimizeWindow} closeWindow={closeWindow} focus={focus} />
          )
        }
      </div>
      <Taskbar username={'Firsto'} processes={processes} />
    </div>
  );
}
```

### DesktopIcon
- The floating labeled icons in the desktop where users double click it to open the program
- Used the App's openProgram (openProgramGlobal) to open the program
```
function DesktopIcon({ program }) {
  const clickHandler = () => openProgramGlobal(program);
  return <div className='desktop-icon' onDoubleClick={clickHandler}>
    <img className='desktop-icon-icon' src={program.icon} alt={program.name + ' icon'} />
    <span className='desktop-icon-label'>{program.name}</span>
  </div>;
}
```

### Window
- The UI to interact with the running process (like a window in every operating system)
- Properties and states
	- process (object) - the process the window is viewing
	- focus (object) - the window that is currently focused, to know if this current window is the focus
	- x and y (numbers) - the xy coordinate position of the window
	- dx and dy (numbers) - used for dragging the window, the offset between the position and the mouse/touchscreen pointer when dragging
	- w and h (numbers) - the width and height of the window
	- isFullScreen (bool) - true when in fullscreen mode, else false
```
function Window({ process, focus }) {
  React.useEffect(() => focusWindowGlobal(process.id), []);
  const [x, setX] = React.useState(Math.floor(Math.random() * 100));
  const [y, setY] = React.useState(Math.floor(Math.random() * 100));
  const [dx, setDx] = React.useState(0);
  const [dy, setDy] = React.useState(0);
  const [w, setW] = React.useState(process.width);
  const [h, setH] = React.useState(process.height);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  ```
- Functions
	- resizeHandler
		- to resize the window (only used in mobile because CSS resize doesn't work in mobile phone)
  - dragStartHandler and dragStartMobileHandler
	  - called on drag start or touch start on the window's header
	  - to get the offset (dx and dy) before dragging
  - dragHandler and dragMobileHandler
	  - called on drag and touch move on the window's header
	  - to move the window (using dx and dy to have the same relative position between the window and the mouse/touchscreen pointer when moving)
  - dragEndHandler
	  - called on drag end
	  - to prevent the default behaviour of the draggable object (moving back to the initial position before dragging)
  - focusHandler, minimizeHandler, closeHandler
	  - used the App's focusWindow, minimizeWindow and closeWindow on the window
  - fullScreenHandler
	  - toggle fullscreen mode by flipping the isFullScreen bool
```
  const resizeHandler = e => {
    setW(e.changedTouches[0].clientX - x);
    setH(e.changedTouches[0].clientY - y);
  }
  const dragStartHandler = e => {
    focusWindowGlobal(process.id);
    setDx(e.clientX - x);
    setDy(e.clientY - y);
  };
  const dragStartMobileHandler = e => {
    focusWindowGlobal(process.id);
    setDx(e.changedTouches[0].clientX - x);
    setDy(e.changedTouches[0].clientY - y);
  };
  const dragHandler = e => {
    setX(e.clientX - dx);
    setY(e.clientY - dy);
  };
  const dragMobileHandler = e => {
    setX(e.changedTouches[0].clientX - dx);
    setY(e.changedTouches[0].clientY - dy);
  };
  const dragEndHandler = e => e.preventDefault();
  const focusHandler = () => focusWindowGlobal(process.id);
  const minimizeHandler = () => minimizeWindowGlobal(process.id);
  const fullScreenHandler = () => setIsFullScreen(!isFullScreen);
  const closeHandler = () => closeWindowGlobal(process.id);
```
- The HTML part
	- Since the child HTML elements inherit the event listeners of their parents, it can cause unintended behaviours
	- To avoid this, I made an invisible div  that represents the click/drag area of the elements that uses some of the handlers above
	- They are the HTML elements that have position:absolute in the styling (styling applied inline)
```
  return (
    <div className='window-container' style={{ top: isFullScreen ? 0 : y, left: isFullScreen ? 0 : x, width: isFullScreen && '100%', height: isFullScreen && '100%', zIndex: process.zIndex, display: process.zIndex < 0 && 'none' }}>
      <div className='window' style={{ position: 'relative', width: isFullScreen ? '100%' : w, height: isFullScreen ? '100%' : h, resize: !isFullScreen && 'both' }}>
        {process !== focus && <div onClick={focusHandler} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}></div>}
        <div onTouchMove={resizeHandler} style={{ position: 'absolute', bottom: 0, right: 0, height: 20, width: 20 }}></div>
        <div className='window-header'>
          <div className='window-name' style={{ position: 'relative' }}>
            <div
              draggable={!isFullScreen ? 'true' : 'false'}
              onDragStart={dragStartHandler}
              onTouchStart={dragStartMobileHandler}
              onDrag={dragHandler}
              onTouchMove={dragMobileHandler}
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
```

### Taskbar
- The navigation tab in the bottom of the website, containing:
	- TaskbarMenu
		- the iconic windows xp start button that shows the list of programs on hover
	- a row of TaskbarButton
		- the buttons that correspond to the running windows. When the window is minimized, clicking it will unminimize the corresponding window
	- TaskbarClock
		- shows the time (hours, minutes and seconds)
```
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
```
### The programs
- Currently, not much program has been added to the desktop. Since this is a personal portfolio, I added some things that most personal portfolios have as a program along with some imitations of windows XP apps such as:
	- Home page
	- About page
	- Projects page
	- Contact page
		- You can send a message to me directly in this program
	- Notepad
	- Internet Explorer
