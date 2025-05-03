import { useEffect, useState } from "react";
import "./App.css";
// Import image files - make sure paths are correct relative to this file
import diamondImage from "./assets/diamond.png";
import bombImage from "./assets/bomb.png";
// Import audio files - make sure paths are correct relative to this file
import bombAudio from "./assets/bomb.mp3";
import diamondAudio from "./assets/diamond.mp3";

// Utility function to generate the layout (can be outside the component)
function generateArrayWithZerosAndOnes(
  totalSize: number = 25, // Default size for a 5x5 grid
  numZeros: number
): number[] {
  // ... (Keep the same generateArrayWithZerosAndOnes function as in the previous answer)
  // --- Input validation and edge cases ---
  if (totalSize <= 0) {
    console.warn("Total size must be positive. Returning empty array.");
    return [];
  }
  if (numZeros < 0) {
    console.warn("Number of zeros cannot be negative. Using 0 zeros.");
    numZeros = 0;
  }
  // Ensure numZeros does not exceed totalSize
  if (numZeros > totalSize) {
    console.warn(
      `Number of zeros (${numZeros}) exceeds total size (${totalSize}). Using total size as number of zeros.`
    );
    numZeros = totalSize;
  }

  const numOnes = totalSize - numZeros;

  // --- Create the initial array with all zeros and ones ---
  const array: number[] = [];

  // Add the specified number of zeros
  for (let i = 0; i < numZeros; i++) {
    array.push(0);
  }

  // Add the remaining number of ones
  for (let i = 0; i < numOnes; i++) {
    array.push(1);
  }

  // --- Shuffle the array (Fisher-Yates algorithm) ---
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }

  return array;
}

function App() {
  const [mines, setMines] = useState<number>(1);
  const [layout, setLayout] = useState<number[]>([]);
  const [revealedStatus, setRevealedStatus] = useState<boolean[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Use memoized Audio objects to avoid creating new ones on every click
  const bombAudioEffect = new Audio(bombAudio); // Use imported audio variable
  const diamondAudioEffect = new Audio(diamondAudio); // Use imported audio variable

  const handleUp = () => {
    if (mines < 20 && !gameOver) {
      // Prevent changing mines after game over
      setMines((prev) => prev + 1);
    }
  };

  const handleDown = () => {
    if (mines > 1 && !gameOver) {
      // Prevent changing mines after game over
      setMines((prev) => prev - 1);
    }
  };

  // Function to set up a new game
  const setupNewGame = () => {
    const newLayout = generateArrayWithZerosAndOnes(25, mines); // Pass total size and number of zeros
    setLayout(newLayout);
    setRevealedStatus(Array(newLayout.length).fill(false));
    setGameOver(false); // Reset game over status
  };

  // Function to handle clicking on a box
  const handleBoxClick = (index: number) => {
    // Prevent clicks if game is over or box is already revealed
    if (gameOver || revealedStatus[index]) {
      return;
    }

    // Create a *copy* of the current revealedStatus array
    const newRevealedStatus = [...revealedStatus];
    // Set the status for the clicked box's index to true (revealed)
    newRevealedStatus[index] = true;
    // Update the state with the new array (triggers re-render and animation)
    setRevealedStatus(newRevealedStatus);

    // --- Game logic and audio ---
    const clickedValue = layout[index];
    if (clickedValue === 0) {
      // It's a mine!
      bombAudioEffect
        .play()
        .catch((e) => console.error("Bomb audio playback failed:", e));

      setGameOver(true); // Game Over

      // Optional: Reveal all mines when a mine is hit (uncomment if desired)
      setTimeout(() => {
        // Add a slight delay to allow the clicked mine to flip first
        setRevealedStatus(Array(layout.length).fill(true));
      }, 300); // Delay slightly longer than the animation duration
    } else {
      // It's an empty square (or a diamond)

      diamondAudioEffect
        .play()
        .catch((e) => console.error("Diamond audio playback failed:", e));

      // Optional: Implement logic to reveal adjacent empty squares (Minesweeper style)
      // This would be a more complex function that recursively updates revealedStatus for neighbors
    }
  };

  // Effect to run when the component mounts or when 'mines' changes
  useEffect(() => {
    setupNewGame(); // Call the setup function
  }, [mines]); // Dependency array: This effect runs whenever the 'mines' state changes

  // Handler for the Retry button
  const handleRetry = () => {
    setupNewGame(); // Call the setup function to start a new game
  };

  return (
    <div className="outerContainer">
      {/* Check your CSS class name case here - assuming 'Topcontainer' matches CSS */}
      <div className="Topcontainer">
        {/* Map over the layout array to render boxes */}
        {layout.map((item, index) => {
          // Determine if this specific box should be revealed
          const isRevealed = revealedStatus[index];

          return (
            // Add the onClick handler to each box
            <div
              key={index} // Remember the key prop
              // Add 'game-over' class if the game has ended
              className={`boxes ${isRevealed ? "revealed" : ""} ${
                gameOver ? "game-over" : ""
              }`}
              onClick={() => handleBoxClick(index)} // Call the handler with the box's index
            >
              {/* Inner container that performs the flip */}
              <div className="box-inner">
                {/* The front side (hidden state) */}
                <div className="box-front"></div>
                {/* The back side (revealed state) */}
                <div className="box-back">
                  {/* Conditionally display the item based on its value */}
                  {item === 1 ? ( // Use strict equality ===
                    <img
                      height={50}
                      width={50}
                      src={diamondImage}
                      alt="Diamond"
                    /> // Use imported image variable
                  ) : (
                    // If item is 0 (mine), display the bomb image when revealed
                    <img height={50} width={50} src={bombImage} alt="Bomb" /> // Use imported image variable
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bottomContainer">
        <h6>Mines: {mines}</h6>
        {/* Disable buttons when game over */}
        <button onClick={handleDown} disabled={gameOver}>
          ⬇️
        </button>
        <button onClick={handleUp} disabled={gameOver}>
          ⬆️
        </button>
        <button onClick={handleRetry}>🔃 Retry</button>{" "}
        {/* Added text for clarity */}
      </div>
    </div>
  );
}

export default App;
