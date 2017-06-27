import {gql, graphql} from 'react-apollo';
import ListPage from '../components/ListPage';

const FeedQuery = gql `query {
  allPosts(orderBy: createdAt_DESC) {
    id
    user {id,name }
    postedFile {id,url }
    description
    karmaPoints
	  category
  }
}`

export default graphql(FeedQuery)(ListPage);
