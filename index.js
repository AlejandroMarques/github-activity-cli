const main = async () => {
  try {
    const events = await fetchEvents();
    logEvents(events);
  } catch (error) {
    console.log(error);
    return;
  }
};

const fetchEvents = async () => {
  const user = process.argv[2];
  if (!user) {
    console.log("Username is required");
    return;
  }
  const url = `https://api.github.com/users/${user}/events`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw "User not found";
    } else {
      throw `Error fetching data: ${response.status}`;
    }
  }
  return await response.json();
};

const logEvents = (events) => {
  if (events.length <= 0) throw `No events found for user ${process.argv[2]}`;
  events.forEach((event) => {
    let message = "";
    switch (event.type) {
      case "CommitCommentedEvent":
        message = `Created a commit comment in ${event.repo.name}`;
        break;
      case "CreateEvent":
        message = `Created ${event.payload.ref_type} ${
          event.payload.ref ? event.payload.ref + " in " : ""
        }${event.repo.name}`;
        break;
      case "DeleteEvent":
        message = `Deleted ${event.payload.ref_type} ${event.payload.ref} in ${event.repo.name}`;
        break;
      case "ForkEvent":
        message = `Forked ${event.payload.forkee.full_name} to ${event.repo.name}`;
        break;
      case "IssueCommentEvent":
        message = `${
          event.payload.action[0].toUpperCase() +
          event.payload.action.substring(1)
        } a comment in an issue in ${event.repo.name}`;
        break;
      case "IssuesEvent":
        message = `${
          event.payload.action[0].toUpperCase() +
          event.payload.action.substring(1)
        } an issue in ${event.repo.name}`;
        break;
      case "MemberEvent": {
        if(event.payload.action === 'added') 
          message = `Added ${event.payload.member} as collaborator in ${event.repo.name}`
        else if(event.payload.action === 'edited')
          message = `Edited ${event.payload.member} permissions in ${event.repo.name}`
        break;
      }
      case 'PublicEvent': 
        message = `Made repository ${event.repo.name} public`
        break;
      case 'PullRequestEvent': {
        const action = event.payload.action[0].toUpperCase() + event.payload.action.substring(1)
        const pullRequest = event.payload.pull_request.title
        message = `${action} pull request ${pullRequest} in ${event.repo.name}`
        break;
      }
      case "PushEvent":
        message = `Pushed ${event.payload.size} commits to ${event.repo.name}`;
        break;

      case "WatchEvent":
        message = `Starred ${event.repo.name} repository`;
        break;
      default: 
        message = `${event.payload.type}`
    }

    console.log(
      `${new Date(event.created_at).toLocaleString("es-ES")} - ${
        event.actor.login
      } ${message}`
    );
  });
};

main();
