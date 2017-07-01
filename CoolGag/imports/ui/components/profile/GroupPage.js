import React from 'react'
import PostPreview from '../PostPreview'
import { gql, graphql, compose } from 'react-apollo'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import MyGroups from '/imports/ui/components/profile/MyGroupsList'
import { Button,Label, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import {Container, Row, Col} from 'reactstrap';
import { Link } from 'react-router';
import GroupMembers from '/imports/ui/components/profile/GroupMembers'
// import GroupPosts from '/imports/ui/components/profile/GroupPosts'
import { GroupPostsQuery } from '/imports/ui/containers/profileLists/GroupPostsQuery'
import CreatePost from '/imports/ui/components/CreatePost'

class GroupPage extends React.Component{
	static propTypes = {
    	data: PropTypes.object,
    	router: React.PropTypes.object.isRequired,
    	params: React.PropTypes.object.isRequired,
  	}
  	constructor(props) {
	    super(props);
	    this.state = {
	      modal: false
	    };

	    this.toggle = this.toggle.bind(this);
	}

	toggle() {
	    this.setState({
	      	modal: !this.state.modal
	    });
	}


  	handleCreatePost = (event) =>{
		this.props.router.replace('/createPost/')
  	}

	render(){
		console.log(this.props)
		if (this.props.data.loading) {
  			return (<div>Loading</div>)
		}

    	if (this.props.data.error) {
      		console.log(this.props.data.error)
      		return (<div>An unexpected error occurred</div>)
		}
		
		return(
			<div>
				<Container>
					<Row>
						<Col xs="12" sm={{ size: 10, offset: 1 }} lg={{ size: 9, offset: 1.5 }}>
							<div className="text-center group-title">{this.props.data.Group.name}</div>
						</Col>
					</Row>
					<Row>
						<Col xs="12" sm="12" md="11" lg="10">
							<div className="pull-right">
								<Button color="info" onClick={ this.toggle }>+&nbsp;Post</Button>
								<Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
						          <ModalHeader toggle={this.toggle}>CreatePost</ModalHeader>
						          <ModalBody>
						          {//<CreatePost group={this.props.data.Group}/>
						          }
						          	
						          </ModalBody>
						          <ModalFooter>
						            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
						          </ModalFooter>
						        </Modal>
							</div>
						</Col>
					</Row>
					<Row>
						<Col xs="12" sm="6" md={{ size: 2, offset: 1 }} lg={{ size: 2.5, offset: 1.5 }}>
							<div className="heading2">Members</div>
							{this.props.data.Group.users.map((groupUser) =>              
                  					<GroupMembers key={groupUser.id} groupUser={groupUser}  data={this.props.data}/>
                  				
                			)}
						</Col>

						<Col xs="12" sm={{ size: 10, offset: 1 }} md={{ size: 7, offset: 1 }} lg={{ size: 6, offset: 1.5 }} className="feed-container">
	                        {this.props.data.Group.posts.map((post) =>
	                            <PostPreview key={post.id} post={post} />
	                        )}
                    	</Col>
					</Row>
				</Container>
			</div>
			)
	}


}


const GroupPageWithData = graphql(GroupPostsQuery, {
  options: (ownProps) => ({
      variables: {
        groupId: ownProps.params.groupId
      }
    })
  }
)(withRouter(GroupPage))

export default GroupPageWithData