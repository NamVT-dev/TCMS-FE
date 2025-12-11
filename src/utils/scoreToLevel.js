
export const LEVEL_RANGES = {
  IELTS: [
    { level: "Starter", min: 0, max: 3.0 },
    { level: "Beginner", min: 3.0, max: 4.0 },
    { level: "Elementary", min: 4.0, max: 4.5 },
    { level: "Pre-Intermediate", min: 4.5, max: 5.0 },
    { level: "Intermediate", min: 5.0, max: 5.5 },
    { level: "Upper-Intermediate", min: 5.5, max: 6.5 },
    { level: "Advanced", min: 6.5, max: 7.5 },
    { level: "Expert", min: 7.5, max: 9.0 },
  ],
  TOEIC: [
    { level: "Starter", min: 0, max: 250 },
    { level: "Beginner", min: 255, max: 400 },
    { level: "Elementary", min: 405, max: 500 },
    { level: "Pre-Intermediate", min: 505, max: 600 },
    { level: "Intermediate", min: 605, max: 780 },
    { level: "Upper-Intermediate", min: 785, max: 900 },
    { level: "Advanced", min: 905, max: 950 },
    { level: "Expert", min: 955, max: 990 },
  ],
};

export const getLevelFromScore = (categoryName, score) => {
  if (!categoryName || score === undefined || score === null) return null;

  const type = categoryName.toUpperCase().includes("IELTS")
    ? "IELTS"
    : categoryName.toUpperCase().includes("TOEIC")
    ? "TOEIC"
    : null;

  if (!type) return null;

  const ranges = LEVEL_RANGES[type];
  
  
  const found = ranges.find(r => score >= r.min && score <= r.max);
  
  return found ? found.level : "Unknown";
};

export const getDisplayRange = (categoryName, levelName) => {
  if (!categoryName || !levelName) return "";
  
  const type = categoryName.toUpperCase().includes("IELTS") ? "IELTS" 
             : categoryName.toUpperCase().includes("TOEIC") ? "TOEIC" 
             : null;

  if (!type) return levelName; 

  const range = LEVEL_RANGES[type].find(r => r.level === levelName);
  
  if (!range) return levelName;

  
  if (type === "IELTS") return `Band ${range.min} - ${range.max}`;
  if (type === "TOEIC") return `${range.min} - ${range.max}+`;
  
  return levelName;
};