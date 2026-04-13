import { run } from "uebersicht";
import { css } from "uebersicht";

export const refreshFrequency = 1000;

const mainColor = "rgb(235, 155, 175)"; 

const container = css`
  display: flex;
  justify-content: center;
  width: 100vw;
  bottom: 100px;
  position: fixed;
`;

const widgetBody = css`
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 8px 24px;
  background-color: rgba(255, 255, 255, 0.3);
  border: 2px solid ${mainColor};
  border-radius: 100px;
  font-family: -apple-system, sans-serif;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(235, 155, 175, 0.2);
`;

const btn = css`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  &:hover { opacity: 0.6; transform: scale(1.1); }
  &:active { transform: scale(0.9); }
`;

const trackText = css`
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: ${mainColor};
  text-shadow: 0px 0px 1px rgba(255,255,255,0.8);
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const command = async (dispatch) => {
  try {
    const isRunning = await run('osascript -e \'tell application "System Events" to (name of processes) contains "Spotify"\'');
    if (isRunning.trim() !== "true") {
      dispatch({ type: 'UPDATE', data: { track: "Spotify Closed", playing: false } });
      return;
    }
    const track = await run('osascript -e \'tell application "Spotify" to artist of current track & " - " & name of current track\'');
    const state = await run('osascript -e \'tell application "Spotify" to player state as string\'');
    dispatch({ type: 'UPDATE', data: { track: track.trim(), playing: state.trim() === "playing" } });
  } catch (e) {
    dispatch({ type: 'UPDATE', data: { track: "Слухайте музику", playing: false } });
  }
};

export const updateState = (event, previousState) => {
  if (event.type === 'UPDATE') return { ...event.data };
  if (event.type === 'TOGGLE_PLAY') return { ...previousState, playing: !previousState.playing };
  return previousState;
};

export const render = ({ track, playing }, dispatch) => {
  const sendCmd = async (cmd) => {
    if (cmd === 'playpause') {
      // Миттєво змінюємо іконку в інтерфейсі
      dispatch({ type: 'TOGGLE_PLAY' });
    }
    await run(`osascript -e 'tell application "Spotify" to ${cmd}'`);
  };

  return (
    <div className={container}>
      <div className={widgetBody}>
        <div className={btn} onClick={() => sendCmd('previous track')}>
          <svg width="14" height="14" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L19 18V6z" fill={mainColor} /></svg>
        </div>
        
        <div className={btn} onClick={() => sendCmd('playpause')}>
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill={mainColor} /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill={mainColor} /></svg>
          )}
        </div>

        <div className={trackText} onClick={() => sendCmd('activate')}>
          {track || "Завантаження..."}
        </div>

        <div className={btn} onClick={() => sendCmd('next track')}>
          <svg width="14" height="14" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill={mainColor} /></svg>
        </div>
      </div>
    </div>
  );
};
