import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import "./../styles/App.css";

const INITIAL_USERS = [
  { id: "1", name: "Aarav" },
  { id: "2", name: "Meera" },
  { id: "3", name: "Kabir" },
];

const INITIAL_POSTS = [
  {
    id: "1",
    title: "Welcome to GenZ",
    content: "Share ideas, connect with creators, and post updates.",
    authorId: "1",
    reactions: [0, 0, 0, 0, 0],
  },
  {
    id: "2",
    title: "React Router Tips",
    content: "Declarative routes keep multi-page views clean and predictable.",
    authorId: "2",
    reactions: [0, 0, 0, 0, 0],
  },
];

const SAMPLE_NOTIFICATIONS = [
  "Meera liked your post 'Welcome to GenZ'.",
  "Kabir started following you.",
  "Aarav commented on 'React Router Tips'.",
];

class PostDetails extends Component {
  constructor(props) {
    super(props);
    const post = this.findPost();
    this.state = {
      isEditing: false,
      editTitle: post ? post.title : "",
      editContent: post ? post.content : "",
    };
  }

  findPost = () => {
    const { posts, match } = this.props;
    return posts.find((p) => String(p.id) === String(match.params.id));
  };

  startEditing = () => {
    const post = this.findPost();
    if (!post) return;
    this.setState({
      isEditing: true,
      editTitle: post.title,
      editContent: post.content,
    });
  };

  handleSave = (e) => {
    e.preventDefault();
    const post = this.findPost();
    if (!post) return;
    this.props.onUpdatePost(post.id, {
      title: this.state.editTitle,
      content: this.state.editContent,
    });
    this.setState({ isEditing: false });
  };

  render() {
    const post = this.findPost();
    const { users, onReact } = this.props;
    const { isEditing, editTitle, editContent } = this.state;

    if (!post) {
      return (
        <div className="post">
          <h2>Post not found</h2>
          <Link to="/" className="button">
            Back to Posts
          </Link>
        </div>
      );
    }

    const author = users.find((u) => String(u.id) === String(post.authorId));

    return (
      <div className="post">
        <h2>{post.title}</h2>
        <p className="post-author">By {author ? author.name : "Unknown"}</p>
        <p>{post.content}</p>

        <div className="reactions-bar">
          {post.reactions.map((count, idx) => (
            <button
              key={idx}
              type="button"
              className="button reaction-btn"
              onClick={() => onReact(post.id, idx)}
            >
              {idx < 4 ? `R${idx + 1} (${count})` : `0`}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="button"
          onClick={this.startEditing}
        >
          Edit
        </button>

        {isEditing && (
          <form onSubmit={this.handleSave} className="edit-post-form">
            <div>
              <input
                id="postTitle"
                type="text"
                placeholder="Post Title"
                value={editTitle}
                onChange={(e) => this.setState({ editTitle: e.target.value })}
              />
            </div>
            <div>
              <textarea
                id="postContent"
                placeholder="Post Content"
                value={editContent}
                onChange={(e) => this.setState({ editContent: e.target.value })}
              />
            </div>
            <button type="submit" className="button">
              Save Post
            </button>
          </form>
        )}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: INITIAL_USERS,
      posts: INITIAL_POSTS,
      postTitle: "",
      postAuthor: INITIAL_USERS[0].id,
      postContent: "",
      selectedUserId: null,
      notifications: [],
    };
  }

  handleAddPost = (e) => {
    e.preventDefault();
    const { postTitle, postAuthor, postContent, posts } = this.state;
    const newPost = {
      id: `${Date.now()}`,
      title: postTitle || "Untitled Post",
      content: postContent || "",
      authorId: postAuthor,
      reactions: [0, 0, 0, 0, 0],
    };

    this.setState({
      posts: [newPost, ...posts],
      postTitle: "",
      postContent: "",
    });
  };

  handleReaction = (postId, reactionIndex) => {
    if (reactionIndex >= 4) {
      return;
    }

    this.setState((prevState) => ({
      posts: prevState.posts.map((post) => {
        if (String(post.id) !== String(postId)) return post;
        const nextReactions = post.reactions.map((count, idx) =>
          idx === reactionIndex ? count + 1 : count
        );
        return { ...post, reactions: nextReactions };
      }),
    }));
  };

  handleUpdatePost = (postId, { title, content }) => {
    this.setState((prevState) => ({
      posts: prevState.posts.map((post) =>
        String(post.id) === String(postId)
          ? { ...post, title, content }
          : post
      ),
    }));
  };

  handleRefreshNotifications = () => {
    this.setState({
      notifications: SAMPLE_NOTIFICATIONS,
    });
  };

  renderPostCard = (post) => {
    const { users } = this.state;
    const author = users.find((u) => String(u.id) === String(post.authorId));

    return (
      <article key={post.id} className="post">
        <h3>{post.title}</h3>
        <p className="post-author">By {author ? author.name : "Unknown"}</p>
        <p>{post.content}</p>

        <div className="reactions-bar">
          {post.reactions.map((count, idx) => (
            <button
              key={idx}
              type="button"
              className="button reaction-btn"
              onClick={() => this.handleReaction(post.id, idx)}
            >
              {idx < 4 ? `R${idx + 1} (${count})` : `0`}
            </button>
          ))}
        </div>

        <Link to={`/posts/${post.id}`} className="button">
          View Post
        </Link>
      </article>
    );
  };

  renderCreatePostForm = () => {
    const { users, postTitle, postAuthor, postContent } = this.state;

    return (
      <form onSubmit={this.handleAddPost} className="create-post-form">
        <div>
          <input
            id="postTitle"
            type="text"
            placeholder="Post Title"
            value={postTitle}
            onChange={(e) => this.setState({ postTitle: e.target.value })}
          />
        </div>
        <div>
          <select
            id="postAuthor"
            value={postAuthor}
            onChange={(e) => this.setState({ postAuthor: e.target.value })}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <textarea
            id="postContent"
            placeholder="Post Content"
            value={postContent}
            onChange={(e) => this.setState({ postContent: e.target.value })}
          />
        </div>
        <button type="submit" className="button">
          Create Post
        </button>
      </form>
    );
  };

  renderFeedPage = () => {
    const { posts } = this.state;

    return (
      <div>
        {this.renderCreatePostForm()}
        <div className="posts-list">
          {posts.map((post) => this.renderPostCard(post))}
        </div>
      </div>
    );
  };

  renderUsersPage = () => {
    const { users, posts, selectedUserId } = this.state;
    const userPosts = selectedUserId
      ? posts.filter((p) => String(p.authorId) === String(selectedUserId))
      : [];

    return (
      <div className="users-page">
        <h2>Users</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                className="button"
                onClick={() => this.setState({ selectedUserId: user.id })}
              >
                {user.name}
              </button>
            </li>
          ))}
        </ul>

        {selectedUserId && (
          <div className="user-posts">
            {userPosts.map((post) => this.renderPostCard(post))}
          </div>
        )}
      </div>
    );
  };

  renderNotificationsPage = () => {
    const { notifications } = this.state;

    return (
      <div className="notifications-page">
        <h2>Notifications</h2>
        <button
          type="button"
          className="button"
          onClick={this.handleRefreshNotifications}
        >
          Refresh Notifications
        </button>

        <section className="notificationsList">
          {notifications.map((note, index) => (
            <div key={index}>{note}</div>
          ))}
        </section>
      </div>
    );
  };

  render() {
    const { posts, users } = this.state;

    return (
      <Router>
        <div className="App">
          <nav className="navbar">
            <Link to="/">Posts</Link>
            <Link to="/users">Users</Link>
            <Link to="/notifications">Notifications</Link>
            <Link to="/create">Create Post</Link>
          </nav>

          <h1>GenZ</h1>

          <Switch>
            <Route exact path="/" render={this.renderFeedPage} />
            <Route exact path="/create" render={this.renderCreatePostForm} />
            <Route exact path="/users" render={this.renderUsersPage} />
            <Route
              exact
              path="/notifications"
              render={this.renderNotificationsPage}
            />
            <Route
              path="/posts/:id"
              render={(routeProps) => (
                <PostDetails
                  {...routeProps}
                  posts={posts}
                  users={users}
                  onReact={this.handleReaction}
                  onUpdatePost={this.handleUpdatePost}
                />
              )}
            />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
