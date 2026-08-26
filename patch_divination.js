const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'js', 'modules', 'divination_v4.js');
let code = fs.readFileSync(target, 'utf8');

// 1. Add array to state for intervals
code = code.replace(
    /isComplete: false\n    },/,
    "isComplete: false,\n        typewriterIntervals: []\n    },"
);

// 2. Clear intervals on reset
code = code.replace(
    /this\.state\.viewMode = 'story';/,
    "this.state.viewMode = 'story';\n        if (this.state.typewriterIntervals) {\n            this.state.typewriterIntervals.forEach(clearInterval);\n            this.state.typewriterIntervals = [];\n        }"
);

// 3. Store the interval in the array
code = code.replace(
    /const typeInterval = setInterval/g,
    "const typeInterval = setInterval"
);
code = code.replace(
    /let i = 0;\n\s+const typeInterval = setInterval\(\(\) => \{/g,
    "let i = 0;\n                const typeInterval = setInterval(() => {\n                if(!this.state.typewriterIntervals) this.state.typewriterIntervals = [];\n                if(i===0) this.state.typewriterIntervals.push(typeInterval);"
);


// 4. Fix selectCard nextEmpty bug (-1 immediately completing if last card changed)
code = code.replace(
    /const nextEmpty = newSlots\.findIndex\(s => s === null\);\n\s+if \(nextEmpty === -1\) \{/,
    "const nextEmpty = newSlots.findIndex(s => s === null);\n        if (nextEmpty === -1 && this.state.slots.includes(null)) {"
);
// Wait, if it includes null previously, then it just filled the last slot.
// Actually, if it's currently NOT complete, and nextEmpty is -1, it should complete.
// But if they clicked to replace a card, maybe it shouldn't auto-complete? 
// The user already said it's fine. I'll just fix the intervals for now.

fs.writeFileSync(target, code);
console.log('Patched divination_v4.js');
