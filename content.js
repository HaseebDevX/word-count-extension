
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "fetchOutline") {
    try {
      console.log("Okay")

      const outline = [];
      const headings = document.querySelectorAll(".navigation-item");

      headings.forEach(async (item) => {
        const headingContent = item.querySelector(".navigation-item-content");

        if (headingContent) {
          let headingLevel;
          if (
            headingContent.classList.contains("navigation-item-title") 
            // headingContent.classList.contains("navigation-item-level-0")
          ) {
            headingLevel = 0;
          } else if (
            headingContent.classList.contains("navigation-item-level-0")
          ) {
            headingLevel = 1;
          } else if (
            headingContent.classList.contains("navigation-item-level-1")
          ) {
            headingLevel = 2;
          } else if (
            headingContent.classList.contains("navigation-item-level-2")
          ) {
            headingLevel = 3; 
          } else if (
            headingContent.classList.contains("navigation-item-level-3")
          ) {
            headingLevel = 4;
          } else if (
            headingContent.classList.contains("navigation-item-level-4")
          ) {
            headingLevel = 5;
          } else if (
            headingContent.classList.contains("navigation-item-level-5")
          ) {
            headingLevel = 6;
          } else {
            headingLevel = 7; // or 'p', depending on your needs
          }

          const textContent = headingContent.innerText || headingContent.textContent;

          outline.push({
            level: headingLevel,
            text: textContent,
            found: headingLevel == 7 ? true : false,
            lineNumber: null,
            wordCount: 0
          });
        }
      });

      const wholeContent = await extractDocsModelChunk();
       
      console.log("OUTLINE: ", wholeContent)

      // console.log("OUTLINES Check Kro Isko: ", outline, wholeContent)
      const outlineResult = await calculateWordCounts(outline, wholeContent);
      // console.log("OUTLINE RESULT: ", outlineResult)

      sendResponse({ outline: outlineResult });

    } catch (error) {
      console.error("Error:", error);
      sendResponse({
        error: "An error occurred while processing the outline.",
      });
    }
    // Return true to indicate that you want to send a response asynchronously
    return true;
  }
});

async function extractDocsModelChunk() {
  // Select all script tags on the page
  const scripts = document.querySelectorAll("script");
  let fullText = "";
  let chunkno = 0;

  // Loop through all script tags to find the one with DOCS_modelChunk
  for (let script of scripts) {
    const text = script.textContent;
    
    if (text.includes("DOCS_modelChunk = ")) {
      // Extract the portion of the script text containing DOCS_modelChunk
      const jsonMatch = text.match(/DOCS_modelChunk\s*=\s*(\[\{[\s\S]*?\}\]);/);
   
      if (jsonMatch) {
        try {
          // Parse the JSON to an object
          const docsModelChunk = JSON.parse(jsonMatch[1]);

          // Process the JSON object to get the text content
          for (const chunk of docsModelChunk) {
            if (chunk.ty === "is" && chunk.s) {
              fullText += chunk.s;
              console.log("CHUNK#",chunkno++,": ", chunk.s );
            }
            
          }

        } catch (e) {
          console.error("Error parsing JSON:", e);
        }
      } else {
        console.error("Could not find DOCS_modelChunk JSON in script text");
      }
    
    }
  }

  console.log("FULLTEXT: ", fullText)
  return fullText; // Return or process the text as needed
}

async function calculateWordCounts(outline, wholeContent) {
  // Ensure outline is an array
  if (!Array.isArray(outline)) {
    throw new TypeError("The 'outline' parameter should be an array.");
  }

  // Split the content by lines and count number of words
  let lineNumber = 0;
  let totalWords = 0;
 
  // const lines = wholeContent
  //   .trim()
  //   .split("\n")
  //   .map((line) => {
  //     console.log("Line--------",line)
  //     const words = line.trim().split(/\s+/);
  //     return { lineNumber: lineNumber++, content: line, wordCount: words.length };
  //   });

  const lines = wholeContent
  .trim()
  .split("\n")
  .map((line) => {
    const words = line.trim().split(/\s+/);
    const content = line.trim().split(/\s+/);
    console.log("testing---------------: ", content.length)
    const result = { lineNumber: lineNumber, content: line, wordCount: words.length };
    lineNumber++;
    return result
  });



  lines.forEach((line) => {
    totalWords += line.wordCount; // Add word count to total
  });
  // console.log("Total Words: ", totalWords, ", Line and Word Counts: ", lines);


  // console.log("BEFORE UPDATE OUTLINE: ", outline);
  // Find line number of each outline
  // Iterate through lines and update outline with line numbers and found status
  // outline.forEach((heading, index) => {
  //   let foundLine = false;
  //   for (let i = 0; i < lines.length; i++) {
  //     const line = lines[i];  
  //     if (line.level === 7)
  //       continue;
  //     if (heading.text.trim() === line.content.trim() && !line.used) {
  //       heading.lineNumber = line.lineNumber;
  //       line.used = true;  // Mark this line as used
  //       foundLine = true;
  //       break;  // Exit the inner loop once the correct match is found
  //     }else{
  //       //console.log(heading.text.trim(),"/n !== /n", line.content.trim());
  //     }
  //   }
  //   heading.found = foundLine;  // Mark the heading as found only if a match was made
  // });

  outline.forEach((heading, index) => {
    let foundLine = false;
  
    // console.log(`Processing heading: "${heading.text.trim()}`);
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
  
      // Skip lines with level 7, as per your logic
      if (line.level === 7) continue;
  
      // Check if heading matches line content and it's not used
      if (heading.text.trim() === line.content.trim() && !line.used) {
        heading.lineNumber = line.lineNumber;  // Assign the line number
        line.used = true;  // Mark line as used
        foundLine = true;
        // console.log(`Matched heading "${heading.text}" to line ${line.lineNumber}`);
        break;  // Exit the loop once a match is found
      } else {
        // Debugging: Show where the match fails
        // console.log(
        //  ` No match: "${heading.text.trim()}" !== "${line.content.trim()}"`
        // );
      }
    }
  
    // If no matching line was found, set lineNumber to 0 or another fallback
    if (!foundLine) {
      console.warn(`No matching line found for heading: "${heading.text.trim()}"`);
      heading.lineNumber = 0;  // Optional: Assign a default value (e.g., 0 or -1)
    }
  
    heading.found = foundLine;  // Mark heading as found or not
  });


  // console.log("UPDATED OUTLINE: ", outline);

  // console.log("Total Words: ", totalWords, ", Line and Word Counts: ", lines);

  // Assuming outline and lines arrays are available
  const combinedData = lines.map((line) => {
    const matchingHeading = outline.find(heading => heading.lineNumber === line.lineNumber);
    const content = matchingHeading ? matchingHeading.text : line.content;
    const words = content.trim().split(/\s+/);
    return {
      lineNumber: line.lineNumber,
      level: matchingHeading ? matchingHeading.level : 7,
      wordCount: line.wordCount < words.length ? words.length : line.wordCount,
      content
    };
  });

  console.log("CombinedData:", combinedData);

  // //Combined Data:  {lineNumber, level, wordCount, content}
  // //Outline: //{level, text, found, lineNumber}
  // const outlineResult = [];

  // //Count number of words in each section
  // for (let outlineNo = 0; outlineNo < outline.length; outlineNo++) {
  //   let lineNo = outline[outlineNo].lineNumber;
  //   while (lineNo == outline[outlineNo].lineNumber || (lineNo < lines.length && outline[outlineNo].level < combinedData[lineNo].level)) {
  //     console.log("lineNo: ", lineNo, ", outlineNo: ", outlineNo);
  //     console.log("Adding ", combinedData[lineNo].wordCount, " to ", outline[outlineNo]);
  //     if (lines[lineNo] && lines[lineNo].content !== '')
  //       outline[outlineNo].wordCount += lines[lineNo].wordCount
  //     lineNo++;
  //   }
  //   console.log("RESULT Outline: ", outline);
  //   outlineResult.push({
  //     level: outline[outlineNo].level,
  //     text: outline[outlineNo].text,
  //     words: outline[outlineNo].wordCount,
  //   });
  // }
  // Combined Data: {lineNumber, level, wordCount, content}
// Outline: {level, text, found, lineNumber}
const outlineResult = [];

// Initialize wordCount to 0 for each outline item
outline.forEach((outlineItem) => {
  outlineItem.wordCount = 0;
});

// Debugging: Check if lines and outline data are aligned properly
console.log("Lines: ", lines);
console.log("Outline: ", outline);

// Count the number of words in each section
for (let outlineNo = 0; outlineNo < outline.length; outlineNo++) {
  let lineNo = outline[outlineNo].lineNumber;
  
  // console.log(`Processing outline ${outlineNo} starting at line ${lineNo}`);

  while (
    lineNo < lines.length &&
    (lineNo === outline[outlineNo].lineNumber || 
     outline[outlineNo].level < combinedData[lineNo].level)
  ) {
    // console.log(`Processing line ${lineNo}: ${lines[lineNo]?.content || 'Empty Line'}`);

    // Check if the line exists and is not empty after trimming
    if (lines[lineNo] && lines[lineNo].content.trim() !== '') {
      outline[outlineNo].wordCount += lines[lineNo].wordCount;
      // console.log(`Added ${lines[lineNo].wordCount} words to outline ${outlineNo}`);
    }
    
    lineNo++;
  }
console.log("wordCount test", outline[outlineNo].wordCount)
console.log("text test", outline[outlineNo].text)

  // Store the result for this outline
  outlineResult.push({
    level: outline[outlineNo].level,
    text: outline[outlineNo].text,
    words: outline[outlineNo].wordCount,
  });

  

  // console.log(`Outline ${outlineNo} result: `, outlineResult[outlineNo]);
}

// Final result
console.log("Final Outline Result: ", outlineResult);

  return outlineResult;
}




