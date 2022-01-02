// TODO: versucht öfter zu löschen. -> Fehlermeldung. aber löscht. Fehler
// liegt glaube ich in Zeile 247, weil beim Löschen eines Bugs mit
// mehrereKindern der currBug undefined ist und
// removeChildOptions() nicht mehr aufgerufen werden kann.

/**
 * [BugManager Manager saves all independent Bugs in a map. Those independent
 * Bugs can have childBugs. These childBugs can have childBugs again and so
 * forth. This is why the BugManager Manage only has to remember the
 * Independent Bugs. This way the structure becomes very clear and it is
 * easily visible which Bugs are independent ("root") Bugs.
 */
class BugManager {
  constructor() {
    this.bugMap=new Map;
    this.people=new Map;
  }
  
  /**
   * [Console logs all Bugs in the BugManager Manger (with children) for
   * testing purposes.]
   */
  bugMapConsole() {
    for(let bug of this.bugMap.values()) {
      console.log("BugManager Map: "+bug.id);
      bug.printChildBugs();
    }
    console.log("-----");
  }
  
  /**
   * [Adds independent BugManager to bugMap. Only "root" Bugs are added to
   * bugMap.]
   * @param bug [BugManager to be added to bugMap.]
   */
  addIndependentBug(bug) {
    this.bugMap.set(bug.id, bug);
  }
  
  /**
   * [adds Person to BugManager bc instructions say "Die Personen werden
   * ebenfalls im Bugverwaltungssystem verwaltet.]
   * @param person [Person to be added.]
   */
  addPerson(person) {
    this.people.set(person.id, person);
    person.addToProcessorSelector();
  }
  
  /**
   * [Gets independent bug or childBug by id.]
   * @param id [id of BugManager to be searched for.]
   * @returns {BugManager|*|undefined}
   */
  getBugsById(id) {
    for(let b of this.bugMap.values()) {
      let bug=b.findBugsById(id);
      if(bug) {
        return bug;
      }
    }
    return undefined;
  }
  
  /**
   * [Deletes entry in bugMap with certain id.]
   * @param id [id of BugManager that is to be deleted.]
   */
  delete(id) {
    this.bugMap.delete(id);
  }
}

/**
 * [Class BugManager creates a bug with id, name, description, processor and
 * parentID. A bug also has a state and child Bugs. Bugs can be added by
 * user and are independent or have dependencies on created bugs. The child
 * Bugs are also of the BugManager class because they have the same
 * properties.
 * Saving the childBugs and parentID is useful since every BugManager can look
 * in both directions - at its "ancestor" and "descendants". ]
 */
class Bug {
  constructor(id, name, description, processors, parentID) {
    this.id=id;
    this.name=name;
    this.description=description;
    this.processors=processors;
    this.childBugs=new Map();
    this.state=false; // false = open, true = closed;
    this.parentID=parentID;
    this.bug=`<div class="bugEntry open" id="${this.id}"><hr>`+
      `<div class="row">`+
      `<div class="colBug col-80">`+
      `<input type="checkbox" name="${this.name}" value="${this.name}">`+
      `<span class="bugName">${this.name}</span>`+
      `</div>`+
      `<div class="colBug col-20">`+
      `<div class="alignRight"><input type="button" value="delete" id="del-${this.id}">`+
      `</div></div></div>`+
      `<div class="alignWithCB"><span>Processors: </span>${this.processors}</div>`+
      `<div class="alignWithCB"><span>Description: </span>${this.description}</div></div>`;
  }
  
  /**
   * [searches through child Bugs and finds them by id]
   * @param id [id of BugManager]
   * @returns {Bug|Bug|Bug|*}
   */
  findBugsById(id) {
    if(this.id===id) {
      return this;
    } else {
      for(let childBug of this.childBugs.values()) {
        let found=childBug.findBugsById(id);
        if(found) {
          return found;
        }
      }
    }
  }
  
  /**
   * [Checks if all of the child Bugs are closed. Returns false, if child
   * Bugs are open, true, if all child Bugs are closed.]
   * @returns {boolean}
   */
  searchChildBugsStates() {
    for(let childBug of this.childBugs.values()) {
      if(childBug.state===false) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * [adds a childBug to the BugManager's childBugs Map.]
   * @param childBug [childBug to be added]
   */
  addChildBug(childBug) {
    this.childBugs.set(childBug.id, childBug);
  }
  
  /**
   * [Print all child Bugs for testing purposes.]
   */
  printChildBugs() {
    console.log("\tNr of children: "+this.childBugs.size);
    for(let cb of this.childBugs.values()) {
      console.log("\t\tChild: "+cb.id+" "+cb.name+" "+cb.state);
      if(cb.childBugs.size>0) {
        cb.printChildBugs();
      }
    }
  }
  
  /**
   * ["print" bugs to index.html.]
   */
  printToHTML() {
    if(this.parentID===undefined) {
      $("#bugEntries").append(this.bug);
      $("#"+this.id).addClass("independent");
    } else {
      let parent="#"+this.parentID;
      $(parent).append(this.bug);
      $("#"+this.id).addClass("childBug");
    }
    let dependencySelector=$("#dependency");
    let option=`<option value="${this.id}">${this.name}</option>`;
    dependencySelector.append(option);
  }
  
  /**
   * [Remove options for dependency for all children upon deleting.]
   */
  removeChildOptions() {
    for(let cB of this.childBugs.values()) {
      if(cB.childBugs.size!==0) {
        cB.removeChildOptions();
      }
      $(`option[value="${cB.id}"]`).remove();
    }
  }
  
  /**
   * [Event Listener for all checkboxes.
   * Parent bugs can only be checked if the children are closed (checked).
   * Child bugs can only be unchecked if the parents are opened again.
   */
  spyOnCheckboxes() {
    $("input[type='checkbox']").on("click", function() {
      let bugID=$(this).parent().parent().parent()[0].id;
      let fullBugID="#"+bugID;
      let currBug=allBugs.getBugsById(bugID);
      if($(this).prop("checked")===false) { //true = closed.
        let parentClosed=true; // parent.state = true; parent Closed
        if(currBug.parentID!==undefined) {
          let parentBug=allBugs.getBugsById(currBug.parentID);
          if(parentBug.state===false) {
            parentClosed=false;
          }
          if(parentClosed) {
            // let current onclick closed bc parent can't be closed when
            // child is open
            $(this).prop("checked", true);
            alert("Depending parent bug "+parentBug.name+" is closed.");
          } else {
            $(fullBugID).removeClass("closed");
            $(fullBugID).addClass("open");
            currBug.state=false;
          }
        } else {
          $(fullBugID).removeClass("closed");
          $(fullBugID).addClass("open");
          currBug.state=false;
        }
      } else if($(this).prop("checked")===true) {
        let childrenClosed;
        if(currBug.childBugs.size===0) {
          childrenClosed=true;
        } else {
          childrenClosed=currBug.searchChildBugsStates();
        }
        
        if(childrenClosed) {
          // all children are closed or there are no children
          $(fullBugID).removeClass("open");
          $(fullBugID).addClass("closed");
          currBug.state=true;
        } else {
          // children aren't closed yet. current BugManager can't be closed
          $(this).prop("checked", false);
          alert("Depending bugs not closed yet");
        }
      }
    });
  }
  
  /**
   * [Event Handler on delete Button for each BugManager. Bugs and their
   * children will be deleted out of the DOM and the BugMap.]
   */
  spyOnDelete() {
    $("input[value='delete']").on("click", function() {
      let bugEntryID=$(this).parent().parent().parent().parent()[0].id;
      let currBug=allBugs.getBugsById(bugEntryID);
      currBug.removeChildOptions();
      
      $("#"+bugEntryID).remove();
      $(`option[value="${bugEntryID}"]`).remove();
      
      if(currBug.parentID===undefined) {
        allBugs.delete(currBug.id);
      } else {
        let parentOfCurrBug=allBugs.getBugsById(currBug.parentID);
        parentOfCurrBug.childBugs.delete(currBug.id);
      }
    });
  }
}

/**
 * [Creates Person for processor selection. In another file than BugManager and
 * BugManager because it is called at a different time and not directly
 * linked to a BugManager.]
 */
class Person {
  constructor(id, firstName, lastName) {
    this.firstName=firstName;
    this.lastName=lastName;
    this.id=id;
  }
  
  /**
   * [Adds Person to the processor selector.]
   */
  addToProcessorSelector() {
    let filter=$("#processors");
    let option=`<option value=" ${this.firstName} ${this.lastName}">`+
    `${this.firstName} ${this.lastName}</option>`
    filter.append(option);
  }
}