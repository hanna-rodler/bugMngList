let idCounter = 1;
let allBugs;

$(function() {
    allBugs = new BugManager();
    addPeople();

    $("#add").on("click", function() {
        addBug();
    });

    /**
     * [Only shows open Bugs.]
     */
    $("#showOpen").on("click", function() {
        $(".closed").hide();
    });

    /**
     * [Shows all Bugs.]
     */
    $("#showAll").on("click", function() {
        $(".closed").show();
    });
});

/**
 * [Adds a BugManager, adds it to the BugManager if the BugManager is independent or adds
 * it to another BugManager as a childBug if not independent.
 * Prints the bug to HTML, puts click handler on checkboxes and delete button.]
 */
function addBug() {
    let name = $("input[name='title']").val();
    let description = $("textarea[name='description']").val();
    let processors = $("#processors").val();
    let parentID = $("#dependency option:selected").val();
    if (parentID === "independent") {
        parentID = undefined;
    }
    let bug = new Bug("bug" + idCounter, name, description, processors, parentID);
    idCounter++;

    if (bug.parentID === undefined) {
        allBugs.addIndependentBug(bug);
    } else {
        let parentBug = allBugs.getBugsById(parentID);
        parentBug.addChildBug(bug);
    }

    bug.printToHTML();

    bug.spyOnCheckboxes();
    bug.spyOnDelete();
    allBugs.bugMapConsole();
}

/**
 * [Creates people and adds them to teh BugManager. In the BugManager the
 * people are printed to the HTML (#processors).]
 */
function addPeople() {
    let p1 = new Person("p1", "Hanna", "Rodler");
    let p2 = new Person("p2", "Lisa", "Drummroll");
    let p3 = new Person("p3", "Sergio", "Niño");
    let p4 = new Person("p4", "Maria", "Trawig");
    let p5 = new Person("p5", "Aneta", "Wartensteiner");
    allBugs.addPerson(p1);
    allBugs.addPerson(p2);
    allBugs.addPerson(p3);
    allBugs.addPerson(p4);
    allBugs.addPerson(p5);
}