var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//on click, transform the desc p element to a textarea element
$(".list-group").on("click", "p", function()
{
  var text = $(this).text().trim();
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

//create the out-of-focus save event
$(".list-group").on("blur", "textarea", function()
{
  //get the textarea's current value/text
  var text = $(this).val().trim();

  //get the parent ul's id attribute
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index();

  //returns the text property of the object of the index in the array of the initial object
  tasks[status][index].text = text;

  saveTasks();
  
  //recreate p element
  var taskP = $("<p>").addClass("m-1").text(text);

  //replace textarea with p element
  $(this).replaceWith(taskP);
});

//on click, transform span element to a textarea element
$(".list-group").on("click", "span", function()
{
  //get current text
  var date = $(this).text().trim();

  //create new input element
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

  //swap elements
  $(this).replaceWith(dateInput);

  //automatically focus on new element
  dateInput.trigger("focus");
});

//create the save event for the due date
$(".list-group").on("blur", "input[type='text']", function()
{
  //get the current text
  var date = $(this).val().trim();

  // get the parent ul's id attribute
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;

  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});

$(".card .list-group").sortable
({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event)
  {
    console.log("activate", this);
  },
  deactivate: function(event)
  {
    console.log("deactivate", this);
  },
  over: function(event)
  {
    console.log("out", event.target);
  },
  out: function(event)
  {
    console.log("out", event.target);
  },
  update: function(event)
  {
    //declare array to store data in
    var tempArr = [];
    //loop over current set of children in sortable list
    $(this).children().each(function()
    {
      var text = $(this).find("p").text().trim();
      var date = $(this).find("span").text().trim();

      //add task data to the temp array as an object
      tempArr.push(
      {
        text: text,
        date: date
      });
    });

    //trim down list's ID to match object property
    var arrName = $(this).attr("id").replace("list-", "");
    //update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function()
{
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function()
{
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function()
{
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate)
  {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push(
    {
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function()
{
  for (var key in tasks)
  {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

//droppable trash function
$("#trash").droppable(
{
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui)
  {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui)
  {
    console.log("out");
  },
  out: function(event, ui)
  {
    console.log("out");
  }
});

// load tasks for the first time
loadTasks();


