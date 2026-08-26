const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'js', 'modules', 'divination_v4.js');
let code = fs.readFileSync(target, 'utf8');

const oldPoints = `<div class="body-viz-container">
                                <div class="body-silhouette"></div>
                                <!-- Chakra Points -->
                                <div class="chakra-point point-head" data-slot="0" onclick="DivinationSystem.setActiveSlot(0)" onmouseenter="DivinationSystem.highlightSlot(0)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_head}" role="button" tabindex="0"></div>
                                <div class="chakra-point point-heart" data-slot="1" onclick="DivinationSystem.setActiveSlot(1)" onmouseenter="DivinationSystem.highlightSlot(1)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_heart}" role="button" tabindex="0"></div>
                                <div class="chakra-point point-hands" data-slot="2" onclick="DivinationSystem.setActiveSlot(2)" onmouseenter="DivinationSystem.highlightSlot(2)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_hands}" role="button" tabindex="0"></div>
                                <div class="chakra-point point-shadow" data-slot="3" onclick="DivinationSystem.setActiveSlot(3)" onmouseenter="DivinationSystem.highlightSlot(3)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_shadow}" role="button" tabindex="0"></div>
                                <div class="chakra-point point-soul" data-slot="4" onclick="DivinationSystem.setActiveSlot(4)" onmouseenter="DivinationSystem.highlightSlot(4)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_soul}" role="button" tabindex="0"></div>
                            </div>`;

const newPoints = `<div class="body-viz-container">
                                <div class="body-silhouette">
                                    <!-- Chakra Points (moved INSIDE silhouette for correct CSS positioning) -->
                                    <div class="chakra-point point-head" data-slot="0" onclick="DivinationSystem.setActiveSlot(0)" onmouseenter="DivinationSystem.highlightSlot(0)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_head}" role="button" tabindex="0"></div>
                                    <div class="chakra-point point-heart" data-slot="1" onclick="DivinationSystem.setActiveSlot(1)" onmouseenter="DivinationSystem.highlightSlot(1)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_heart}" role="button" tabindex="0"></div>
                                    <div class="chakra-point point-hand-l" data-slot="2" onclick="DivinationSystem.setActiveSlot(2)" onmouseenter="DivinationSystem.highlightSlot(2)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_hands}" role="button" tabindex="0"></div>
                                    <div class="chakra-point point-hand-r" data-slot="2" onclick="DivinationSystem.setActiveSlot(2)" onmouseenter="DivinationSystem.highlightSlot(2)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_hands}" role="button" tabindex="0"></div>
                                    <div class="chakra-point point-soul" data-slot="4" onclick="DivinationSystem.setActiveSlot(4)" onmouseenter="DivinationSystem.highlightSlot(4)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_soul}" role="button" tabindex="0"></div>
                                    <div class="chakra-point point-shadow" data-slot="3" onclick="DivinationSystem.setActiveSlot(3)" onmouseenter="DivinationSystem.highlightSlot(3)" onmouseleave="DivinationSystem.highlightSlot(-1)" data-label="\${DB.TRANSLATIONS[System.lang].divination_shadow}" role="button" tabindex="0"></div>
                                </div>
                            </div>`;

code = code.replace(oldPoints, newPoints);
fs.writeFileSync(target, code);
console.log('Patched body-silhouette HTML structure');
