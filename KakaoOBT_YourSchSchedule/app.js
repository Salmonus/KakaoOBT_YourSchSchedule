Yoursch = "" //Write your school name(South Korea Only)

// Importing the necessary modules
const express = require('express');
const apiRouter = express.Router();

// Middleware
app.use(logger('dev', {}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route handling
app.use('/api', apiRouter);

// API Endpoint for getting the time
apiRouter.post('/getTime', async function(req, res) {
  // Getting the meal response
  let meal = await example();
  const mealRes = meal.split('\n');

  // Date and time handling
  let today = new Date();
  let dayOfWeek = today.getDay();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth() + 1;
  let currentDate = today.getDate();

  console.log(req.body.userRequest.utterance);
  
  const question = String(req.body.userRequest.utterance);
  const weekdaySchedule = await getWeekdaySchedule(question);

  if(weekdaySchedule != undefined){
      console.log('/getTime ON');
      
      // Class information
      const gradeCode = parseInt(question[0]);
      const classCode = parseInt(question[4]);

      // Schedule information
      const subjects = weekdaySchedule.map(sch => sch.subject);

      const responseBody = buildResponseBody(currentYear, currentMonth, currentDate, gradeCode, classCode, subjects, mealRes);
      res.send(responseBody);

  } else if(dayOfWeek == 0 || dayOfWeek == 6){
      const responseBody = buildWeekendResponseBody();
      res.send(responseBody);

  } else if(weekdaySchedule == undefined){
      const responseBody = buildErrorResponseBody();
      res.send(responseBody);
  }
});

// Server listening
app.listen(3000, function() {
  console.log('Skill server listening on port 3000!');
});


// Function to build response body
function buildResponseBody(currentYear, currentMonth, currentDate, gradeCode, classCode, subjects, mealRes) {
  const responseBody = {
    "version": "2.0",
    "template": {
      "outputs": [
        {
          "simpleText": {
            "text": `${currentYear}년 ${currentMonth}월 ${currentDate}일 수업 시간표~!!\n오늘도 화이팅!🥳🥳🥳`
          }
        },
        {
          "carousel": {
            "type": "listCard",
            "items": [
              {
                "header": {
                  "title": "오‍‍전‍‍🌄"
                },
                "items": buildClassItems(gradeCode, classCode, subjects, '조회', ['조회🌇(08:45~09:00)', '1교시🕘(09:00~09:45)', '2교시🕙(09:55~10:40)', '3교시🕚(10:50~11:35)', '4교시🕛(11:45~12:30)'])
              },
              {
                "header": {
                  "title": "급식정보🍱"
                },
                "items": buildMealItems(mealRes)
              },
              {
                "header": {
                  "title": "오후🌞"
                },
                "items": buildClassItems(gradeCode, classCode, subjects, '종례', ['5교시🕧(13:20~14:05)', '6교시🕜(14:15~15:00)', '7교시🕝(15:10~15:55)', '종례🌆(15:55~)'])
              },
            ]
          }
        }
      ]
    }
  };
  return responseBody;
}

// Function to build class items
function buildClassItems(gradeCode, classCode, subjects, additionalSubject, timeSlots) {
  let items = [];
  for(let i = 0; i < timeSlots.length; i++) {
    let title = timeSlots[i];
    let description = i == 0 ? additionalSubject : subjects[i - 1] ? subjects[i - 1] : `오늘은 ${i}교시가 없습니다.`;
    let link = {
      "web": ""//makeZoomURL(searchZoomID(gradeCode, classCode, i == 0 ? additionalSubject : subjects[i - 1]))
    }
    items.push({ title, description, link });
  }
  return items;
}

// Function to build meal items
function buildMealItems(mealRes) {
  return [
    {
      "title": "밥🍚",
      "description": mealRes[1]
    },
    {
      "title": "국🥣",
      "description": mealRes[2]
    },
    {
      "title": "메인반찬🥩🥓🐔🐡",
      "description": mealRes[3]
    },
    {
      "title": "서브반찬 I🥬",
      "description": mealRes[4] + ", " + mealRes[5]
    },
    {
      "title": "서브반찬 II🥒",
      "description": mealRes[6] + ", " + mealRes[7]
    }
  ];
}


// Function to build response body when it is a weekend
function buildWeekendResponseBody() {
  const responseBody = {
    "version": "2.0",
    "template": {
      "outputs": [
        {
          "simpleText": {
            "text": "Weekend"
          }
        }
      ]
    }
  };
  return responseBody;
}

// Function to build response body when weekday schedule is undefined
function buildErrorResponseBody() {
  const responseBody = {
    "version": "2.0",
    "template": {
      "outputs": [
        {
          "simpleText": {
            "text": "Internal Server Error"
          }
        }
      ]
    }
  };
  return responseBody;
}

function makeZoomURL(value){
	if(value != ''){
    const main = "https://us04web.zoom.us/j/"
    const pwd = "1234"
    var url = ''
	var url = main + value + "?pwd=" + pwd + " "
    return url}
}
/*
function searchZoomID(cls, cls2, sub){
    // find Zoom ID
    // return
    if(sub == "조회" || sub == "종례" || sub =="창1"){
        return masterZoomId[parseInt(cls)-1][parseInt(cls2)-1]}
    if (sub == "스포"){
        return sportZoomId[parseInt(cls) - 1][parseInt(cls2) - 1]}
    var cls2 = parseInt(cls2)
    if (cls == "1"){
        if (sub == '국어'){
            if(cls2 == "6" || cls2 == "7"){
                return ""}
            else return ""}
        else if (sub == '사회'){
            return "979-285-5590"}
        else if (sub == '도덕'){
            if (cls2 == "5" || cls2 == "6" || cls2 == "7"){
                return "530-192-6716"}
            else return "989-691-0472"}
        else if (sub == '수학'){
            if (cls2 == 6 || cls2 == 7) return "403-399-3598"
            else return "794-637-9716"}
        else if (sub == '수탐'){

			if (cls2 == 1) return "955-291-9689"
//rest of the code
            else return "255-816-9121"}
    
            if (cls2 == 5 || cls2 == 6) return "528-285-0436"
            else return "687-326-4449"}
        return ""}
*/

const getTime = async (grade, classNum) => 
{
	try
	{
  await timetable.init();
  const school = await timetable.search(Yoursch);
  await timetable.setSchool(school[0].code);
  const result = await timetable.getTimetable();
  const scheduleObj = result[grade][classNum]
  return scheduleObj;
	}
  catch(error){
	  console.log(error)
  }
};

const getWeekdaySchedule = async(question) => {
		if(typeof parseInt(question[0]) === "number" && typeof parseInt(question[4]) === "number") {
			const F_result = await getTime(parseInt(question[0]), parseInt(question[4]))
			const todaySchedule = F_result[day-1]
			return todaySchedule;
		} else {
			return false;
		}
		
}