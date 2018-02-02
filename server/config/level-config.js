const startingExperience = 30;
const maxLevel = 20;
const experiencePerVote = 10;
const maxVotesPerPostIncrement = 5;
const startingDailyPoints = 13;
const dailyPointsIncrement = 2;
const minimumDuelLevel = 5;
const maxQuests = 5;

var titleRequirements = {
    //levelRequiered: titleName
    0: "Rookie",
    2: "Beginner",
    5: "Apprentice",
    10: "Expert", 
    12: "Exceptional",
    20: "Master", 
    30: "Visionary",
    50: "God"
}; 

var gigabanned = ["77.71.46.170, 162.158.210.117", "109.160.103.118, 162.158.91.226"]       
  
var storyCharacteristics  =  ['Characters', 'Story', 'Dialogue'];
var defaultCharacteristics = ["characters","story",'dialogue','style','rhythm','feel','originality','je ne sais quoi'];
var purchasableCharacteristics = ["atmosphere","argumentation","depictions","twist","introduction","charm","erotic",
                                "thesis","scary","tension","motivating","depressive","enthusiastic","logical", "humour"]
var poemCharacteristics = ['Style', 'Rythm', 'Feel'];

var otherCharacteristics =  ['Originality', 'Feel', 'Je ne sais quoi'];

var duelCharacteristics = ['Story 1', 'Tie', 'Story 2'];

var levelExperienceRequirement = function(level) {
    return Math.ceil(Math.pow(2, level) * startingExperience);
};

var maxDailyWorks = function(level){
    if(level<5)
    {
        return 1;
    }
    else if(level<8)
    {
        return 2;
    }
    else if(level<12)
    {
        return 3;
    }
    else 
    {
        return 4;
    }
}
var maxVotesPerPost = function(level){
    return maxVotesPerPostIncrement * level;
};
var dailyPoints = function(level){
    return startingDailyPoints + level * dailyPointsIncrement;
};

var getPromotionPointsForLevel = function(level){
    return level * 5;
};


module.exports = {
    startingExperience: startingExperience,
    maxLevel: maxLevel,
    levelExperienceRequirement: levelExperienceRequirement,
    experiencePerVote: experiencePerVote,
    maxVotesPerPost: maxVotesPerPost,
    startingDailyPoints: startingDailyPoints,
    maxQuests: maxQuests,
    dailyPoints: dailyPoints,
    titleRequirements: titleRequirements,
    storyCharacteristics: storyCharacteristics,
    poemCharacteristics: poemCharacteristics,
    otherCharacteristics: otherCharacteristics,
    duelCharacteristics: duelCharacteristics,
    getPromotionPointsForLevel: getPromotionPointsForLevel,
    minimumDuelLevel: minimumDuelLevel,
    maxDailyWorks: maxDailyWorks,
    defaultCharacteristics:defaultCharacteristics,
    purchasableCharacteristics: purchasableCharacteristics,
    gigabanned: gigabanned
};
