const loadingUrl = 'http://localhost:3000/';

//this variables are accesed all over the code to enable or disable features
var interface_variables = {
    lines: true,
    squares: false,
    removed: false,
    added: false,
    bars: false,
    congruence: false,
    merge: false,
    split: false,
    rename: false,
    move: false,
    bundling: 0.5,
    changedLines: false,
};

//Used when the buttton exit is cliked
function onSalir() {
    window.location.replace(loadingUrl);
}

//writes to info square
//used in other modules
function showInfo(title, body) {
    if (title) {
        $('.infoTitle').html(title);
    }

    if (body) {
        $('.infoBody').html(body);
    }
}

//enable and disable the direrent interface variables

function onLineChange() {
    interface_variables.lines = !interface_variables.lines;
}

function onBoxChange() {
    interface_variables.squares = !interface_variables.squares;
}

function onRemovedChange() {
    interface_variables.removed = !interface_variables.removed;
}

function onBarsChange() {
    interface_variables.bars = !interface_variables.bars;
}

function onAddedChange() {
    interface_variables.added = !interface_variables.added;
}

//task activating functionss
function onCongruenceChange() {
    interface_variables.congruence = !interface_variables.congruence;
    interface_variables.changedLines = true;
}
function onMergeChange() {
    interface_variables.merge = !interface_variables.merge;
    interface_variables.changedLines = true;
}
function onSplitChange() {
    interface_variables.split = !interface_variables.split;
    interface_variables.changedLines = true;
}

function onRenameChange() {
    interface_variables.rename = !interface_variables.rename;
    interface_variables.changedLines = true;
}

function onMoveChange() {
    interface_variables.move = !interface_variables.move;
    interface_variables.changedLines = true;
}

function onSliderChange(value) {
    interface_variables.bundling = value / 100;
}

function onMatrixClicked(value) {
    //
}

function onExpand() {
    expandAllLevels();
}
