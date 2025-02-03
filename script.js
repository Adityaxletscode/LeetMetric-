document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.querySelector(".search-btn");
  const usernameInput = document.querySelector(".user-input");
  const stats = document.querySelector(".stats");
  const easyProgressCircle = document.querySelector(".easy-stat");
  const mediumProgressCircle = document.querySelector(".medium-stat");
  const hardProgressCircle = document.querySelector(".hard-stat");
  const allCircle = document.querySelector(".all-stat");
  const easyLabel = document.querySelector(".easy-label");
  const mediumLabel = document.querySelector(".medium-label");
  const hardLabel = document.querySelector(".hard-label");
  const allLabel = document.querySelector(".all-label");
  const error = document.querySelector(".error");
  const ranking = document.querySelector(".rank");
  const circles = document.querySelectorAll(".circle");

  function validateUsername(username) {
    if (username.trim() === "") {
      error.style.display = "block";
      hideCircles();
      hideRank();
      return false;
    }
    const regex = /^(?!.*__)[a-zA-Z0-9](?!.*_$)[a-zA-Z0-9_]{1,14}[a-zA-Z0-9]$/;
    const isMatching = regex.test(username);
    if (!isMatching) {
      error.style.display = "block";
      hideCircles();
      hideRank();
      return false;
    }
    error.style.display = "none";
    showCircles();
    showRank();
    return isMatching;
  }

  async function fetchUserDetails(username) {
    try {
      searchButton.innerHTML = '<img src="searching.svg" alt="Searching">';
      searchButton.disabled = true;
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const targetUrl = "https://leetcode.com/graphql/";
      const myHeaders = new Headers();
      myHeaders.append("content-type", "application/json");

      const graphql = JSON.stringify({
        query: `
          query userSessionProgress($username: String!) {
            allQuestionsCount {
              difficulty
              count
            }
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
                totalSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
              profile {
                ranking
              }
            }
          }
        `,
        variables: {
          username: `${username}`
        }
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
        redirect: "follow",
      };

      const response = await fetch(proxyUrl + targetUrl, requestOptions);
      if (!response.ok) {
        throw new Error("unable to fetch the user details");
      }
      const parsedata = await response.json();
      console.log("user Data:", parsedata);
      displayUserData(parsedata);
    } catch (error) {
      stats.innerHTML = '<p class="notFound">No Data Found</p>';
      hideRank();
    } finally {
      searchButton.innerHTML = '<img src="search.svg" alt="Search">';
      searchButton.disabled = false;
    }
  }

  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 100;
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    label.textContent = `${label.textContent.split(':')[0]}: ${solved}/${total}`;
    console.log(label.textContent);
  }

  function updateRank(rank) {
    ranking.textContent = `Rank: ${rank || 'N/A'}`;
  }

  function displayUserData(parsedata) {
    const totalQues = parsedata.data.allQuestionsCount[0].count;
    const totalEasyQues = parsedata.data.allQuestionsCount[1].count;
    const totalMediumQues = parsedata.data.allQuestionsCount[2].count;
    const totalHardQues = parsedata.data.allQuestionsCount[3].count;

    const solvedTotalQuest = parsedata.data.matchedUser.submitStats.acSubmissionNum[0].count;
    const solvedTotalEasyQuest = parsedata.data.matchedUser.submitStats.acSubmissionNum[1].count;
    const solvedTotalMediumQuest = parsedata.data.matchedUser.submitStats.acSubmissionNum[2].count;
    const solvedTotalHardQuest = parsedata.data.matchedUser.submitStats.acSubmissionNum[3].count;

    const rankDetails = parsedata.data.matchedUser.profile.ranking;

    updateProgress(solvedTotalEasyQuest, totalEasyQues, easyLabel, easyProgressCircle);
    updateProgress(solvedTotalMediumQuest, totalMediumQues, mediumLabel, mediumProgressCircle);
    updateProgress(solvedTotalHardQuest, totalHardQues, hardLabel, hardProgressCircle);
    updateProgress(solvedTotalQuest, totalQues, allLabel, allCircle);
    updateRank(rankDetails);
  }

  function hideCircles() {
    circles.forEach(circle => circle.style.display = "none");
  }

  function showCircles() {
    circles.forEach(circle => circle.style.display = "flex");
  }

  function hideRank() {
    ranking.style.display = "none";
  }

  function showRank() {
    ranking.style.display = "flex";
  }

  searchButton.addEventListener("click", function () {
    const username = usernameInput.value;
    console.log("usrname:", username);
    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });
});
