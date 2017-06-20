import { gql, graphql } from 'react-apollo';
import DownvoteListPage from '../../components/profile/DownvoteListPage';



const DownvotePostsQuery = gql`query {
    user{
        id
        downvotedPosts(orderBy: createdAt_DESC) {
            id
        	  postedFile { id, url }
            description
        }
    }
}`

export default graphql(DownvotePostsQuery)(DownvoteListPage);
