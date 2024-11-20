// python -m http.server

// It really doesn't matter what these values are since we're comparing 2 things and they're constant between them but whatever
// random %: variation is about + -1.5 % (1 / 64)
const MIN_VARIANCE = 0.984375;
const MAX_VARIANCE = 1.015625;

function runDoACalc() {

    let [hp, mdef, pdef, mdefbuff, pdefbuff, elemresR, elemres, stance] = getCharInfo();
    let [patk, patkPer, patkBuff, matk, matkPer, matkBuff, elemBuff, pskill, mskill, peskill, meskill] = getEnemyInfo();
    var outputStr = "Alive";

    // Physical Elemental dmg
    [minPE, maxPE, avgPE] = calculateEnemySkillDamage(patk, peskill, patkPer + patkBuff, elemres, stance, elemBuff, elemresR, pdef, pdefbuff);

    // Magical Elemental dmg
    [minME, maxME, avgME] = calculateEnemySkillDamage(matk, meskill, matkPer + matkBuff, elemres, stance, elemBuff, elemresR, mdef, mdefbuff);


    // Physical Non-Elemental dmg
    [minP, maxP, avgP] = calculateEnemySkillDamage(patk, pskill, patkPer + patkBuff, 0, stance, 0, 0, pdef, pdefbuff);

    // Magical Non-Elemental dmg
    [minM, maxM, avgM] = calculateEnemySkillDamage(matk, mskill, matkPer + matkBuff, 0, stance, 0, 0, mdef, mdefbuff);

    outputStr = "Physical Non-Elemental: "
    if (minP > hp) {
        outputStr += "You will always be dead!"
    }
    else if (minP < hp && hp < maxP) {
        outputStr += "Sometimes you're dead. Your fate is up to RNG God!"
    }
    else if (hp > minP) {
        outputStr += "You will live."
    }
    outputResult(outputStr, minP, maxP, true);

    outputStr = "Physical Elemental: "
    if (minPE > hp) {
        outputStr += "You will always be dead!"
    }
    else if (minPE < hp && hp < maxPE) {
        outputStr += "Sometimes you're dead. Your fate is up to RNG God!"
    }
    else if (hp > minPE) {
        outputStr += "You will live."
    }
    outputResult(outputStr, minPE, maxPE);

    outputStr = "Magical Non-Elemental: "
    if (minM > hp) {
        outputStr += "You will always be dead!"
    }
    else if (minM < hp && hp < maxM) {
        outputStr += "Sometimes you're dead. Your fate is up to RNG God!"
    }
    else if (hp > minM) {
        outputStr += "You will live."
    }
    outputResult(outputStr, minM, maxM);

    outputStr = "Magical Elemental: "
    if (minME > hp) {
        outputStr += "You will always be dead!"
    }
    else if (minM < hp && hp < maxME) {
        outputStr += "Sometimes you're dead. Your fate is up to RNG God!"
    }
    else if (hp > minME) {
        outputStr += "You will live."
    }
    outputResult(outputStr, minME, maxME);
}

function outputResult(outputStr, min, max, clearResult=false) {
    var element = document.getElementById("result");

    if (clearResult) {
        element.innerHTML = ''
    }
    var item = document.createElement("h4");
    item.innerHTML = outputStr;
    element.appendChild(item);

    item = document.createElement("p");
    item.innerHTML = "Min Damage Taken is: ~" + min;
    element.appendChild(item);

    item = document.createElement("p");
    item.innerHTML = "Max Damage Taken is: ~" + max;
    element.appendChild(item);
}

function replaceHeaderWithOptionName(event) {
    const targetElement = event.target;

    var divSibling = targetElement.parentNode.parentNode.firstElementChild;

    divSibling.innerHTML = targetElement.innerHTML
}
function getEnemyInfo() {
    var patk = parseInt(document.getElementById('enemyPatk').value);
    var patkPer = convertPercentTextToValue(document.getElementById('enemyPermPatk').innerHTML);
    var patkBuff = convertEnemyPatkBuffTextToValue(document.getElementById('enemyPatkBuff').innerHTML);
    var matk = parseInt(document.getElementById('enemyMatk').value);;
    var matkPer = convertPercentTextToValue(document.getElementById('enemyPermMatk').innerHTML);
    var matkBuff = convertEnemyMatkBuffTextToValue(document.getElementById('enemyMatkBuff').innerHTML);
    var elemBuff = convertEnemyElemBuffTextToValue(document.getElementById('enemyElemBuff').innerHTML);
    var pskill = parseInt(document.getElementById('enemyPSkill').value) / 100;
    var mskill = parseInt(document.getElementById('enemyMSkill').value) / 100;
    var peskill = parseInt(document.getElementById('enemyElemPSkill').value) / 100;
    var meskill = parseInt(document.getElementById('enemyElemMSkill').value) / 100;

    return [patk, patkPer, patkBuff, matk, matkPer, matkBuff, elemBuff, pskill, mskill, peskill, meskill];
}

function convertEnemyPatkBuffTextToValue(text) {
    return convertEnemyMatkBuffTextToValue(text);
}

/*
    https://discord.com/channels/936517645275107378/973765964653010974/1195608543752106015
    used on enemies
    attack - 15 %, 30 %, 50 %, 75 %, 100 % / -10% per level
    defense - 15 %, 30 %, 50 %, 75 %, 100 % / -15%, -25%, -35%, -45%, -55%
    elemental resistances(these are additive, not multiplicative) - 20 % per level / -15 %, -30 %, -50 %, -75 %, -100 %
*/
function convertEnemyMatkBuffTextToValue(text) {
    switch (text) {
        case "None":
            return 0;
        case "Buff: Low":
            return 0.15;
        case "Buff: Mid":
            return 0.30;
        case "Buff: High":
            return 0.5;
        case "Buff: Extra High":
            return 0.75;
        case "Buff: Extreme":
            return 1;
        case "Debuff: Low":
            return -0.10;
        case "Debuff: Mid":
            return -0.20;
        case "Debuff: High":
            return -0.30;
        case "Debuff: Extra High":
            return -0.40;
        case "Debuff: Extreme":
            return -0.50;
        default:
            console.log("Code does not match html value.")
            return 0;
    }
}

/*
    https://discord.com/channels/936517645275107378/973765964653010974/1217658941362933831
    damage formula stuff for new element buff/debuffs
    from 5 down stacks -> 5 up stacks
    on us: -70 %, -55 %, -40 %, -25 %, -10 %, 10 %, 25 %, 40 %, 60 %, 80 %
    on enemies: -70 %, -55 %, -40 %, -25 %, -10 %, 15 %, 30 %, 50 %, 75 %, 100 %
    this is a completely separate multiplier in the damage formula
*/
function convertEnemyElemBuffTextToValue(text) {
    switch (text) {
        case "None":
            return 0;
        case "Buff: Low":
            return 0.15;
        case "Buff: Mid":
            return 0.30;
        case "Buff: High":
            return 0.50;
        case "Buff: Extra High":
            return 0.75;
        case "Buff: Extreme":
            return 1.0;
        case "Debuff: Low":
            return -0.10;
        case "Debuff: Mid":
            return -0.25;
        case "Debuff: High":
            return -0.40;
        case "Debuff: Extra High":
            return -0.55;
        case "Debuff: Extreme":
            return -0.7;
        default:
            console.log("Code does not match html value.")
            return 0;
    }
}

function getCharInfo() {
    var hp = document.getElementById('charHp').value;
    var mdef = document.getElementById('charMdef').value;
    var pdef = document.getElementById('charPdef').value;

    // charInfo
    var mdefbuff = convertMdefBuffTextToValue(document.getElementById('charMdefBuff').innerHTML);
    var pdefbuff = convertPdefBuffTextToValue(document.getElementById('charPdefBuff').innerHTML);
    var elemresR = convertPercentTextToValue(document.getElementById('charElemResistR').innerHTML);
    var elemres = convertElemResistTextToValue(document.getElementById('charElemResist').innerHTML);
    var stand = convertStandTextToValue(document.getElementById('charStand').innerHTML);

    return [parseInt(hp), parseInt(mdef), parseInt(pdef), mdefbuff, pdefbuff, elemresR, elemres, stand]
}

function convertStandTextToValue(text) {
    switch (text) {
        case "Attack":
            return 0;
        case "Defense":
            return -0.3;
        case "Defense (Co-op Unison)":
            return -0.4;
        default:
            console.log("Code does not match html value.")
            return 0;
    }
}

function convertPercentTextToValue(text) {
    if (text == "None") { return 0; }

    return parseFloat(text)/100;
}

/*
    https://discord.com/channels/936517645275107378/973765964653010974/1195608543752106015
    used on us
    attack - +-10 % per level
    defense - 20 %, 50 %, 80 %, 110 %, 150 % / -15% per level
    elemental resistances(these are additive, not multiplicative) - 25 %, 37.5 %, 50 %, 62.5 %, 75 % / -15%, -30%, -50%, -75%, -100%
*/
function convertElemResistTextToValue(text) {
    switch (text) {
        case "None":
            return 0;
        case "Buff: Low":
            return 0.25;
        case "Buff: Mid":
            return 0.375;
        case "Buff: High":
            return 0.5;
        case "Buff: Extra High":
            return 0.625;
        case "Buff: Extreme":
            return 0.75;
        case "Debuff: Low":
            return -0.15;
        case "Debuff: Mid":
            return -0.3;
        case "Debuff: High":
            return -0.5;
        case "Debuff: Extra High":
            return -0.75;
        case "Debuff: Extreme":
            return -1.0;
        default:
            console.log("Code does not match html value.")
            return 0;
    }
}

function convertPdefBuffTextToValue(text) {
    return convertMdefBuffTextToValue(text)
}

/*
    https://discord.com/channels/936517645275107378/973765964653010974/1195608543752106015
    used on us
    attack - +-10 % per level
    defense - 20 %, 50 %, 80 %, 110 %, 150 % / -15% per level
    elemental resistances(these are additive, not multiplicative) - 25 %, 37.5 %, 50 %, 62.5 %, 75 % / -15%, -30%, -50%, -75%, -100%
*/
function convertMdefBuffTextToValue(text) {
    switch (text) {
        case "None":
            return 0;
        case "Buff: Low":
            return 0.2;
        case "Buff: Mid":
            return 0.5;
        case "Buff: High":
            return 0.8;
        case "Buff: Extra High":
            return 1.1;
        case "Buff: Extreme":
            return 1.5;
        case "Debuff: Low":
            return -0.15;
        case "Debuff: Mid":
            return -0.3;
        case "Debuff: High":
            return -0.45;
        case "Debuff: Extra High":
            return -0.6;
        case "Debuff: Extreme":
            return -0.75;
        default:
            console.log("Code does not match html value.")
            return 0;

    }
}

/*
    https://discord.com/channels/936517645275107378/973765964653010974/1199622828559958057
    simplified base damage formulas(excludes unused mechanics)
    ours: (attack * 50) / (enemyDefense * 2.2 + 100)
    enemies: (enemyAttack * 2000) / (defense * 100 + 10000)

    multiplier portion of the formula
    baseDamage * skill% * critical% * limitCombo% * (1 - damageResist%) * (1 - elementResist%) * (1 - elementResistBuffDebuff%) * (1 + battleBoost%) * (1 + statusCondition%) * (1 + damageBoost% + damageTakenBoost%) * random% * (1 + finalDamage%)
    skill%: multiplier on the skill * materia support * sum of applicable equipment damage boosts
    critical%: minimum of 1, only used if a crit (1.5 default, 20% crit damage = 1.7, 20% crit resist = 1.3)
    damageResist%: damage resistance
    elementResist%: element resistance
    elementResistBuffDebuff%: total of the element resist buffs / debuffs on the target
    battleBoost%: unsure, assumed to be related to tower floors and crisis dungeons
    statusCondition%: sleep makes this 1
    damageBoost%: attack stance boost (this does not include the phys/mag potency stats)
    damageTakenBoost%: defense stance boost
    random%: variation is about +-1.5% (1/64)
    finalDamage%: guild ranking related
    if 0 damage is dealt, then it deals 1 instead


    enemyAttack = skill*(1+patkUp%)*(1+elemResistDown%)*(1+elemDmgUp%)*(1+maxStance)*(1-weaknessResistance%)
*/
function calculateEnemySkillDamage(mpatk, skillPotency, mpatkPercent, elemResistDown, stance, elemDmgUpPercent, charElementResist, charDefense, charDefBuff) {
    var minSkillDamage;
    var maxSkillDamage;
    var basicSkillDamage;

/*    console.log("PMatk: " + mpatk)
    console.log("skillPotency: " + skillPotency)
    console.log("mpatkPercent: " + mpatkPercent)
    console.log("elemResistDown: " + elemResistDown)
    console.log("stance: " + stance)
    console.log("elemDmgUpPercent: " + elemDmgUpPercent)
    console.log("charWeaknessResistance: " + charElementResist)
    console.log("charDefense: " + charDefense)
    console.log("charDefBuff: " + charDefBuff)
*/
    var enemyAttack = mpatk * skillPotency * (1 + mpatkPercent) * (1 - elemResistDown) * (1 - charElementResist) * (1 + elemDmgUpPercent) * (1 + stance)

    var skill = 2000 * enemyAttack / (charDefense * (1 + charDefBuff) * 100 + 10000);
    minSkillDamage = Math.floor(skill * MIN_VARIANCE);
    maxSkillDamage = Math.floor(skill * MAX_VARIANCE);
    basicSkillDamage = Math.floor((minSkillDamage + maxSkillDamage) / 2);

    return [minSkillDamage, maxSkillDamage, basicSkillDamage];
}
