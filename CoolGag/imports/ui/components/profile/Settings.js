import React from 'react'
import { gql, graphql, compose, withApollo } from 'react-apollo'
import { withRouter, Redirect } from 'react-router'
import { Button, ButtonGroup, Col, Row, Container, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import NavPersonalLists from './NavPersonalLists'
import ContentEditable from 'react-contenteditable';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';
import Popup from 'react-popup';
import FileSelectButton from './../FileHandling/FileSelectButton';
import WindowDropZone from './../FileHandling/WindowDropZone';
import FileHandling from './../FileHandling/FileHandling';
import PredefinedMemeSelect from './../PredefinedMemeSelect';

class Settings extends React.Component {

	static propTypes = {
		router: PropTypes.object,
		mutate: PropTypes.func,
		data: PropTypes.object,
	};

	state = {
		imageUrl: '',
		imageSize: {width: 0, height: 0},
		isSubmitting: false,
		isRendering: false,
		file: null,
		postedFileId: '',
		isDraggingFile: false,
		isValidType: true,
		isLoadingFile: false,
		isEditingPicture: false,
		isPasswordSubmittable: false,
		isEmailSubmittable: false,
		newPassword: '',
		newEmail: '',
	};

	constructor(props) {
	    super(props);
	    this.state = {
	      modalDelete: false,

	    };

	    this.toggleDelete = this.toggleDelete.bind(this);

  	}

	toggleDelete() {
		this.setState({
		 	modalDelete: !this.state.modalDelete
		});
	}


	render() {
		if (this.props.data.loading) {
			return (<div>Loading</div>)
		}

		// redirect if no user is logged in
		if (!this.props.data.user) {
			console.warn('Only logged in users can watch their profile.');
			this.props.router.replace('/');
		}

		return (
			<div>
			<Container>
				<Row>
					<Col>
						<h1 className="profileName text-center">Hey {this.props.data.user.name}, lets update your profile!</h1>
					</Col>
				</Row>
					{!this.state.isEditingPicture && this.props.data.user.profilePic && this.props.data.user.profilePic.url &&
						<div className="setting-profile-image changePicture">
							<Row>
								<Col className="text-center">
									<Button className="pa3 bn ttu pointer bg-black-10 dim btn-normal" type="button" value="Delete" onClick={this.handleDeletePic.bind(this)} >Delete</Button>{" "}
									<Button className="pa3 bn ttu pointer bg-black-10 dim btn-normal" type="button" value="Update" onClick={this.startChoosingImage.bind(this)}>Update</Button>
								</Col>
							</Row>
							<Row>
								<Col>
									<div className="center-picture">
										<img src={this.props.data.user.profilePic.url} crossOrigin='Anonymous' role='presentation' className='img-responsive w-100 profilePic editProfilePic' onError={this.onProfileImageLoadError.bind(this)} />
									</div>
								</Col>
							</Row>
						</div>
					}
					
					{!this.state.isEditingPicture && !(this.props.data.user.profilePic && this.props.data.user.profilePic.url) &&
					<Row>
						<Col>	
						<div className="setting-profile-default-image">
							<div className="center-picture">
									<div >
										<svg width="100%" height="100%" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
											<path d="M65.904,52.834c-4.734,3.725-10.695,5.955-17.172,5.955c-6.316,0-12.146-2.119-16.821-5.68C16.654,55.575,5,68.803,5,84.757 c0,17.711,14.356,6.197,32.065,6.197h25.868C80.643,90.954,95,102.468,95,84.757C95,68.051,82.22,54.333,65.904,52.834z" fill="#5a0000"/>
											<path d="m48.732 55.057c13.285 0 24.092-10.809 24.092-24.095 0-2.1031-0.27084-4.1442-0.77947-6.0902-1.8787-4.3822 8.5763-5.105 5.6621-20.437-4.3832 12.115-12.076 9.1999-13.982 7.68-4.1173-3.2825-9.3298-5.2464-14.993-5.2464-5.5341 0-10.638 1.8757-14.711 5.0247-3.0862 2.4557-10.352 3.617-14.38-7.562-3.0717 14.595 7.1947 15.878 5.7569 20.62-0.49546 1.9222-0.75905 3.9365-0.75905 6.0112 1e-3 13.286 10.809 24.095 24.093 24.095z" fill="#5a0000"/>
											<text x="20" y="72" fill="white" fontSize="7pt">Add an image
												<tspan x="25" y="85">of yourself!</tspan>
											</text>
										</svg>
									</div>
							</div>
							<div className="text-center">
								<Button className="pa3 bn ttu pointer bg-black-10 dim btn-normal" type="button" value="Upload a picture" onClick={this.startChoosingImage.bind(this)}>Edit picture </Button>
							</div>
						</div>
						</Col>
					</Row>
					}
					<form className={'profileForm'} onSubmit={this.handleUpload.bind(this)}>
						{this.state.isEditingPicture &&
							<div className="text-center">
								<Row>
									<Col>
										<span >
											<FileSelectButton onSelect={this.handleFileSelect.bind(this)} />
											<WindowDropZone
												onDragStart={this.onDragStart.bind(this)}
												onDragEnd={this.onDragEnd.bind(this)}
												onDropFiles={this.onDropFiles.bind(this)} />
										</span>
										{/*
										{" "}<Button type="cancel" disabled={!this.isPasswordSubmittable()} onClick={this.cancelEditPicture.bind(this)} className={'pa3 bn ttu pointer' + (this.state.isSubmitting ? " black-30 bg-black-05 disabled" : " bg-black-10 dim" )}>
											Cancel
										</Button>
										*/}
										{" "}
										<Button type="submit" disabled={!this.isPasswordSubmittable()} className={'pa3 bn ttu pointer' + (this.isSubmittable() ? " bg-black-10 dim" : " black-30 bg-black-05 disabled")}>
											{this.state.isSubmitting ? (this.state.isRendering ? 'Rendering...' : 'Submitting ...') : 'Submit'}
										</Button>
									</Col>
								</Row>
							</div>
						}
					</form>						
					<Row>
						<Col>
							<form className="setting-form">
								<div>
									<form onSubmit={this.handleSubmit}>
									  	<input
										className='w-100 pa3 mv2'
										value={this.state.newPassword}
										placeholder='enter new password'
										onChange={(e) => this.setState({newPassword: e.target.value})} />
									 	<Button type="submit" disabled={!this.isPasswordSubmittable()} className={'pa3 bn ttu pointer' + (this.isPasswordSubmittable() ? " bg-black-10 dim " : " black-30 bg-black-05 disabled")} onClick={this.state.changePassword}>change password</Button>
								  	</form>
								</div>
								<div>
									<form onSubmit={this.handleSubmit}>
										<input
											className='w-100 pa3 mv2'
											value={this.state.newEmail}
											placeholder='enter new email'
											onChange={(e) => this.setState({newEmail: e.target.value})} />
										 <Button type="submit" disabled={!this.isPasswordSubmittable()} className={'pa3 bn ttu pointer' + (this.isEmailSubmittable() ? " bg-black-10 dim" : " black-30 bg-black-05 disabled")} onClick={this.state.changeEmail}>change email</Button>
									 </form>
								</div>
							</form>
						</Col>
					</Row>
					<Row>
						<Col>
							<Button data-target="#deleteProfile" color="danger" onClick={this.toggleDelete}>Delete Profile</Button>
			                <Modal id="deleteProfile" isOpen={this.state.modalDelete} toggle={this.toggleDelete}>
			                  	<ModalHeader toggle={this.toggleDelete}>Delete Profile</ModalHeader>
			                  	<ModalBody className="text-center">
			                    	Are you sure that you want to delete your Profile?
			                  	</ModalBody>
				                <ModalFooter>
				                    <Button color="primary" onClick={this.toggleDelete} onClick={this.handleUserDeletion}>Delete</Button>{' '}
				                    <Button color="secondary" onClick={this.toggleDelete}>Cancel</Button>
				                </ModalFooter>
			                </Modal>
						</Col>
					</Row>			
				</Container>
			</div>
		);
	}

	startChoosingImage() {
		this.setState({
			isEditingPicture: true
		});
	}

	cancelEditPicture() {
		if(!this.state.isSubmitting) {
			this.setState({
				isEditingPicture: true,
				imageUrl: '',
				imageSize: {width: 0, height: 0},
				file: null,
			});
		}
	}

	onProfileImageLoadError() {
		this.props.data.user.profilePic = null;
	}

	isSubmittable() {
		return this.state.file && this.state.imageUrl && !this.state.isSubmitting;
	}


	onDragStart(validType) {
		this.setState({
			isDraggingFile: true,
			isValidType: validType
		});
	}
	onDragEnd() {
		this.setState({
			isDraggingFile: false
		});
	}
	onDropFiles(files) {
		if(files.length >= 1) {
			this.handleFileSelect(files[0]);
		}
	}

	onImageLoadError(event) {
		console.log('error');
		this.setState({'imageUrl': ''});
		this.setState({'file': null});
	}

	onImageLoaded(event) {
		var imageElement = event.nativeEvent.srcElement || event.nativeEvent.originalTarget;
		$('.uncheckedSpelling').attr('spellcheck', 'false');
		this.setState({
			imageSize: {width: imageElement.naturalWidth, height: imageElement.naturalHeight},
			isLoadingFile: false
		});
	}

	handleFileSelect(file) {
		if(file != null) {
			this.setState({
				file: null,
				imageUrl: '',
				isLoadingFile: true,
			});
			FileHandling.getDataUrl(file, (result) => {
				this.setState({
					file: file,
					imageUrl: result,
					isLoadingFile: false
				});
			});
		}
	}

	handleUpload(event) {
		event.preventDefault();
		this.setState({'isSubmitting': true});

		var continueUpload = () => {
			fetch('https://api.graph.cool/file/v1/cj2ryvxmbt4qw0160y6qhdgdl', {
				body: data,
				method: 'POST'
			}).then((response) => {
				response.json().then(result => {
					//this.setState({imageUrl: result.url});
					this.setState({postedFileId: result.id});
					this.setState({userId: this.props.data.user.id});
					var {postedFileId, userId} = this.state;
					this.props.changeProfilePic({
						variables: {
							postedFileId: result.id,
							userId: this.props.data.user.id
						},
						refetchQueries: [{
              				query: profileData,
            			}]
					});
					this.setState({'isSubmitting': false});
					this.props.router.replace('/settings/');
				});
			}).catch((exception) => {
				// TODO: handle upload error
				console.log('error uploading the profile picture!');
				this.setState({'isSubmitting': false});
				this.props.router.replace('/settings/');
			});
		};

		let data = new FormData();
		data.append('data', this.state.file);
		continueUpload();

		this.setState({'isEditingPicture': false});
		return false;
	}

	handleDeletePic(event) {
		event.preventDefault();
		this.setState({'isSubmitting': true});

		this.setState({fileId: this.props.data.user.profilePic.id});
		this.setState({userId: this.props.data.user.id});
		var {fileId, userId} = this.state;
		this.props.deleteProfilePic({
			variables: {
				userId: this.props.data.user.id,
				fileId: this.props.data.user.profilePic.id
			},
			refetchQueries: [{
              query: profileData,
            }]
		}).then(({ data}) => {
			
		  console.log("got data", data);
		})
		.catch((exception) => {
			// TODO: handle upload error
			console.log('error deleting the profile picture!');
			this.setState({'isSubmitting': false});
			this.props.router.replace('/settings/');
		});
		this.setState({'isSubmitting': false, 'isEditingPicture': false});
		return false;
	}

	handleUserDeletion = () => {
	  const userId = this.props.data.user.id;
	  this.props.deleteUser({
		  mutation: deleteUser,
		  variables: { userId },
		})
		.then(({ data }) => {

		  console.log("got data", data);
		})
		.catch(error => {
		  console.log("there was an error sending the query", error);
		});
	};

	isPasswordSubmittable() {
	  if (this.state.newPassword != '') {
		return true;
	  } else {
		return false;
	  }
	}
	isEmailSubmittable() {
	  if (this.state.newEmail != '') {
		return true;
	  } else {
		return false;
	  }
	}

	handleSubmit(event) {
	  event.preventDefault();
	}

	changePassword = () => {
      const newPassword = this.state.newPassword;
	  const userId = this.props.data.user.id;
	  this.props.data.changeUserPassword({
		  mutation: changePassword,
		  variables: {
			  userId,
			  newPassword
		  }
	  })
    }
	changeEmail = () => {
      const {newEmail} = this.state.newEmail
	  const userId = this.props.data.user.id;
      this.props.data.changeUserEmail({
		  mutation: changeEmail,
		  variables: {
			  userId,
			  newEmail
		  }
	  })
    }
}


const profileData = gql` query profileData{
		user {
			id
			name
			createdAt
			karma
			profilePic {
				id
				url
			}
		}
	}
`
const deleteUser = gql`
  	mutation deleteUser($userId: ID!) {
		deleteUser(id: $userId){
	  		id
		}
	}`;

const uploadPicture = gql`
	mutation ($userId: ID!, $postedFileId: ID!) {
		setUserOnFile(
			userProfilePicUserId: $userId,
			profilePicFileId: $postedFileId
		)
		{
			userProfilePicUser {
				id
			}
		}
	}
`

const deletePicture = gql`
	mutation ($userId: ID!, $fileId: ID!) {
		unsetUserOnFile(
			userProfilePicUserId: $userId,
			profilePicFileId: $fileId
		)
		{
			userProfilePicUser {
				id
			}
		},
		deleteFile(
			id: $fileId
		)
		{
			id
		}
	}
`
const changePassword = gql`
	mutation ($userId: ID!, $password: String!) {
		updateUser(
			userID: $userId){
			password
		}
	}
`
const changeEmail = gql`
	mutation ($userId: ID!, $email: String!) {
		updateUser(
			userID: $userId){
				email
		}
	}
`

export default compose(
	graphql(uploadPicture, { name: 'changeProfilePic' } ),
	graphql(deletePicture, { name: 'deleteProfilePic'} ),
	graphql(changePassword, { name: "changeUserPassword" }),
	graphql(changeEmail, { name: "changeUserEmail" }),
	graphql(deleteUser, { name: "deleteUser"}),
	graphql(profileData)
)(withApollo(withRouter(Settings)))
