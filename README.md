# KakaoOBT_YourSchSchedule
This is a Kakaotalk OBT Chatbot Skill Server that sends school schedule json in a carousel form.

# Kakao School Schedule Bot

This project is a backend server for the KakaoOBT chatbot. It provides school schedules (for South Korean schools) through a simple chat interface.

## Overview

The server uses Express to serve an API endpoint that accepts POST requests. The endpoint accepts a school grade and class number, retrieves the corresponding school schedule and meal plan, and returns this data in a format suitable for a KakaoOBT chatbot response.

This server also integrates with another project to parse and retrieve the school schedules. Please visit the [comcigan-parser](https://github.com/leegeunhyeok/comcigan-parser) GitHub page to set up and run this project, which this server depends on.

School names should be searched on the following site: [컴시간학생.kr](http://컴시간학생.kr)

To set up a KakaoOBT chatbot, please refer to the [official KakaoOBT guide](https://i.kakao.com/docs/getting-started-overview#%EC%B1%97%EB%B4%87-%EA%B4%80%EB%A6%AC%EC%9E%90%EC%84%BC%ED%84%B0-%EA%B5%AC%EC%A1%B0).

## How to Use

1. Clone this repository
2. Run `npm install` to install dependencies
3. Set up and run the [comcigan-parser](https://github.com/leegeunhyeok/comcigan-parser) project
4. Replace `Yoursch` variable in the code with your school name
5. Start the server by running `node app.js` or `npm start`
6. Use the server's POST endpoint with the KakaoOBT chatbot

## Dependencies

- Express
- body-parser
- morgan
- axios
