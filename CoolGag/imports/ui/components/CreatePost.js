import React from 'react';
import { withRouter } from 'react-router';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import {Button} from 'reactstrap';
import ContentEditable from 'react-contenteditable';
import ReactDOM from 'react-dom';

class CreatePost extends React.Component {

	static propTypes = {
		router: React.PropTypes.object,
		mutate: React.PropTypes.func,
		data: React.PropTypes.object
	}

	state = {
		description: '',
		category: '',   //this is an enum, options need to be loaded from enum properties
		imageUrl: '',
		imageSize: {width: 0, height: 0},
		isSubmitting: false,
		file: null,
		postedFileId: '',
		isDraggingFile: false,
		isValidType: true,
		dragMightEnded: false,
		isLoadingFile: false,
		isTextEntered: false,
		isPredefinedMeme: false,
		userId: '',
		upperImageText: 'Enter',
		lowerImageText: 'Text'
	}
	
	static fontSizePercentage = 0.09;
	static textStyle = {};

	isSubmittable() {
		return this.state.description && this.state.file && !this.state.isSubmitting;
	}

	onDrop(event) {
		event.stopPropagation();
		event.preventDefault();
		this.setState({'dragMightEnded': false});
		this.setState({'isDraggingFile': false});
		var file = null;
		if(event.dataTransfer.files.length >= 1) {
			file = event.dataTransfer.files[0];
		}
		this.handleFileSelect(file);
		return false;
	}
	onDragOver(event) {
		event.stopPropagation();
		event.preventDefault();
		var validType;
		if(event.dataTransfer.types.length == 1 && event.dataTransfer.types[0] == 'Files') {
			event.dataTransfer.dropEffect = 'copy';
			validType = true;
		} else {
			event.dataTransfer.dropEffect = 'none';
			validType = false;
		}
		this.setState({'dragMightEnded': false, 'isValidType': validType, 'isDraggingFile': true});
		return false;
	}
	onDragEnter(event) {
		if(event.target == document) {
			event.stopPropagation();
			event.preventDefault();
			return false;
		}
	}
	onDragLeave(event) {
		if(event.target == document.body || event.target == document.body.parentElement) {
			event.stopPropagation();
			event.preventDefault();
			this.setState({'isDraggingFile': false});
			return false;
		} else {
			this.setState({'dragMightEnded': true});
			window.setTimeout(() => {
				if(this.state.dragMightEnded) {
					this.setState({'dragMightEnded': false});
					this.setState({'isDraggingFile': false});
				}
			}, 0);
		}
	}
	onWindowResize(event) {
		this.recalcImageFontSize();
	}
	dropHandler = null;
	dragOverHandler = null;
	dragEnterHandler = null;
	dragLeaveHandler = null;
	onWindowResizeHandler = null;
	componentDidMount(a,b,c,d) {
		this.dropHandler = (event) => {return this.onDrop(event);};
		document.addEventListener('drop', this.dropHandler);
		this.dragOverHandler = (event) => {return this.onDragOver(event);};
		document.addEventListener('dragover', this.dragOverHandler);
		this.dragEnterHandler = (event) => {return this.onDragEnter(event);};
		document.addEventListener('dragenter', this.dragEnterHandler);
		this.dragLeaveHandler = (event) => {return this.onDragLeave(event);};
		document.addEventListener('dragleave', this.dragLeaveHandler);
		this.onWindowResizeHandler = (event) => {return this.onWindowResize(event);};
		window.addEventListener('resize', this.onWindowResizeHandler);
	}
	componentWillUnmount() {
		document.removeEventListener('drop', this.dropHandler);
		this.dropHandler = null;
		document.removeEventListener('dragover', this.dragOverHandler);
		this.dragOverHandler = null;
		document.removeEventListener('dragenter', this.dragEnterHandler);
		this.dragEnterHandler = null;
		document.removeEventListener('dragleave', this.dragLeaveHandler);
		this.dragLeaveHandler = null;
		window.removeEventListener('resize', this.onWindowResizeHandler);
		this.onWindowResizeHandler = null;
	}

	render () {
		if (this.props.data.loading) {
			return (<div>Loading</div>)
		}

		// redirect if no user is logged in
		if (!this.props.data.user) {
			console.warn('only logged in users can create new posts')
			this.props.router.replace('/')
		}

		return (
			<div className='w-100 pa4 flex justify-center'>
				<form style={{ maxWidth: 400 }} className='' onSubmit={(event) => {this.handlePost(event)}}>
					<input
						className='w-100 pa3 mv2'
						value={this.state.description}
						placeholder='Description'
						onChange={(e) => this.setState({description: e.target.value})}
					/>
					<input
						className='w-100 pa3 mv2'
						value={this.state.category}
						placeholder='Category -> Try KITTENS or WTF'
						onChange={(e) => this.setState({category: e.target.value})}
					/>
					<button type="button" className='pa3 bn ttu pointer bg-black-10 dim' onClick={()=>{$('[name="imageFile"]').click();}}>Select File</button>
					&nbsp;
					<button type="button" className='pa3 bn ttu pointer bg-black-10 dim' onClick={this.onSelectMeme.bind(this)}>Select Meme</button>
					<input type='file' name='imageFile' className='w-100 pa3 mv2' style={{display: 'none'}} accept="image/*"
						onChange={this.onFileSelected.bind(this)}
						onClick={(event)=> {
							event.target.value = null;
						}}
					/>
					{ !this.state.imageUrl &&
						<div className='w-100 dropzone mv3'>
							{ !this.state.isLoadingFile && !this.state.isDraggingFile &&
								<span>Kein Bild ausgewählt.</span>
							}
							{ this.state.isLoadingFile &&
								<span>Processing File...</span>
							}
							{ this.state.isDraggingFile && this.state.isValidType &&
								<span>Drop to Upload</span>
							}
							{ this.state.isDraggingFile && !this.state.isValidType &&
								<span>Invalid File</span>
							}
					</div>
					}
					{ this.state.imageUrl &&
						<div className={'imagePreviewCotnainer w-100 mv3' + (this.state.isDraggingFile ? ' isDragging' : '')}>
							<div className={'imagePreview' + (this.state.isTextEntered ? ' textEntered' : '')}>
								<img src={this.state.imageUrl} role='presentation' className='w-100' onLoad={this.onImageLoaded.bind(this)} onError={this.onImageLoadError.bind(this)} />
								<ContentEditable
									className={"outlined upper imageText uncheckedSpelling" + (this.state.isTextEntered ? '' : ' placeholder')}
									html={this.state.upperImageText}
									onChange={this.onImageTextChanged.bind(this, 'upperImageText')}></ContentEditable>
								<ContentEditable
									onFocus={(event)=>{console.log('onFocus');}}
									className={"outlined lower imageText uncheckedSpelling" + (this.state.isTextEntered ? '' : ' placeholder')}
									html={this.state.lowerImageText}
									onChange={this.onImageTextChanged.bind(this, 'lowerImageText')}></ContentEditable>
							</div>
							{ (this.state.isDraggingFile || this.state.isLoadingFile) &&
								<div className='w-100 dropzone'>
									{ this.state.isDraggingFile && this.state.isValidType &&
										<span>Drop to Upload</span>
									}
									{ this.state.isDraggingFile && !this.state.isValidType &&
										<span>Invalid File</span>
									}
									{ this.state.isLoadingFile &&
										<span>Processing File...</span>
									}
								</div>
							}
						</div>
					}
					<button type="submit" disabled={(this.isSubmittable() ? "" : "disabled")} className={'pa3 bn ttu pointer' + (this.isSubmittable() ? " bg-black-10 dim" : " black-30 bg-black-05 disabled")}>{this.state.isSubmitting ? 'Submitting ...' : 'Post'}</button>
				</form>
			</div>
		)
	}
				//<button type="button" onClick={this.generateImage.bind(this)}>Test Image Generation</button>
				//<canvas id="generationTest" width="400" height="300" />
	
	recalcImageFontSize(element) {
		if(!element) {
			$('.imagePreview').each((i, e)=>{
				this.recalcImageFontSize(e);
			});
		} else {
			$(element).css({'font-size': $(element).width() * CreatePost.fontSizePercentage + "px"});
		}
	}

	handlePost = (event) => {
		event.preventDefault();
		this.setState({'isSubmitting': true});
		
		let data = new FormData();
		data.append('data', this.state.file);

		fetch('https://api.graph.cool/file/v1/cj2ryvxmbt4qw0160y6qhdgdl', {
			body: data,
			method: 'POST'
		}).then((response) => {
			response.json().then(result => {
				//self.setState({imageUrl: result.url});
				this.setState({postedFileId: result.id});
				this.setState({userId: this.props.data.user.id});
				var {description, category, postedFileId, userId} = this.state
				if(category == "") {
					category = null;
				}
				this.props.mutate({variables: {description, postedFileId, category, userId}})
					.then(() => {
						this.props.router.replace('/')
					});
			});
		}).catch((exception) => {
			// TODO: handle upload error
			console.log('error uploading the file!');
			this.setState({'isSubmitting': false});
		});
		
		return false;
	}
	
	onImageLoadError(event) {
		console.log('error');
		this.setState({'imageUrl': ''});
		this.setState({'file': null});
	}
	
	onImageLoaded(event) {
		this.recalcImageFontSize(event.nativeEvent.srcElement);
		$('.uncheckedSpelling').attr('spellcheck', 'false');
		var imageElement = event.nativeEvent.srcElement;
		this.setState({imageSize: {width: imageElement.naturalWidth, height: imageElement.naturalHeight}});
	}

	onFileSelected(event) {
		if(event.target.files.length >= 1) {
			var file = event.target.files[0];
			this.handleFileSelect(file);
		}
	}
	handleFileSelect(file) {
		this.setState({'file': file});
		if(file != null) {
			var reader = new FileReader();

			this.setState({imageUrl: ""});
			this.setState({isLoadingFile: true});
			// TODO: handle errors
			reader.addEventListener("load", () => {
				this.setState({
					imageUrl: reader.result,
					isLoadingFile: false,
					isPredefinedMeme: false
				});
			}, false);

			reader.readAsDataURL(file);
		} else {
			this.setState({imageUrl: ''});
		}
	}
	
	onSelectMeme(event) {
		console.log('TODO: implement select of predefined image');
		window.alert('This feature is currently not available.');
	}
	
	
	// ContentEditable: https://github.com/lovasoa/react-contenteditable
	onImageTextChanged(stateName, event) {
		if(event.nativeEvent && event.nativeEvent.srcElement) {
			if(typeof event.nativeEvent.srcElement.innerHTML == "string") {
				var value = event.nativeEvent.srcElement.innerHTML;
				var previousValue = this.state[stateName];
				if(value != previousValue) {
					tmp = {isTextEntered: true};
					tmp[stateName] = event.nativeEvent.srcElement.innerHTML;
					this.setState(tmp);
				}
			}
		}
	}
	
	// Image from DOM: https://developer.mozilla.org/de/docs/Web/HTML/Canvas/Drawing_DOM_objects_into_a_canvas
	generateImage() {
		//var canvas = document.createElement('canvas');
		var canvas = document.getElementById('generationTest');
		var ctx = canvas.getContext('2d');
		
		canvas.width = this.state.imageSize.width;
		canvas.height = this.state.imageSize.height;
		canvas.style = 'width: ' + canvas.width + 'px; height: ' + canvas.height + 'px';
		var fontSize = this.state.imageSize.width * CreatePost.fontSizePercentage;
		
		var data =
			'<svg xmlns="http://www.w3.org/2000/svg" width="' + canvas.width + '" height="' + canvas.height + '">' +
				'<foreignObject width="100%" height="100%">' +
					'<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:' + fontSize + 'px">' +
						'<img src="' + this.state.imageUrl + '" />' +
						'<em>I</em> like ' + 
						'<span style="color:white; text-shadow:0 0 2px blue;">' +
						'cheese</span>' +
					'</div>' +
				'</foreignObject>' +
			'</svg>';

		var DOMURL = window.URL || window.webkitURL || window;
		
		var img = new Image();
		var svg = new Blob([data], {type: 'image/svg+xml'});
		var url = DOMURL.createObjectURL(svg);
		
		img.onload = function () {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);
			DOMURL.revokeObjectURL(url);
		}
		
		img.src = url;
	}
	
	// used to create submittable content from an image url
	// see: https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
	dataURItoBlob(dataURI) {
		// convert base64/URLEncoded data component to raw binary data held in a string
		var byteString;
		var parts = dataURI.split(',');
		if (parts[0].indexOf('base64') >= 0)
			byteString = atob(parts[1]);
		else
			byteString = unescape(parts[1]);

		// separate out the mime component
		var mimeString = parts[0].split(':')[1].split(';')[0];

		// write the bytes of the string to a typed array
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		return new Blob([ia], {type:mimeString});
	}
}

const createPost = gql`
	mutation ($description: String!, $category: POST_CATEGORY, $postedFileId: ID!, $userId: ID!) {
		createPost(
			description: $description,
			postedFileId: $postedFileId,
			category: $category,
			userId: $userId) {
			id
			postedFile { id }
		}
	}
`

const userQuery = gql`
	query {
		user {
			id
		}
	}
`

export default compose(
  graphql(createPost),
  graphql(userQuery, { options: { forceFetch: true }} )
)(withRouter(CreatePost))


// export default graphql(createPost)(
// 	graphql(userQuery, { options: { forceFetch: true }} )(withRouter(CreatePost))
// )
