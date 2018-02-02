module.exports = {
    wallProjection: {
        title: 1,
        author: 1,
        coverSmall: 1,
        postType: 1,
        characteristics: 1,
        quote: 1,
        isPromoted: 1,
        postedOn: 1,
        topic: 1,
        secondPost: 1,
        youtubeEmbed: 1,
        commentCount: { $size: '$comments'}
    },
    forumProjection: {
        title: 1,
        author: 1,
        sectionId: 1,
        quote: 1,
        lastCommentOn: 1,
        commentCount:  { $size: '$comments'}
    },
    profilePostProjection: {
        title: 1,
        postedOn: 1,
        postType: 1,
        quote: 1
    },
    userPostPageProjection: {
        username: 1,
        displayName: 1,
        banned: 1,
        avatar: 1,
        level: 1,
        title: 1,
        customTitle: 1,
        characteristics: 1,
        signature: 1
    },
    userPreviewProjection: {
        username: 1,
        displayName: 1,
        avatar: 1,
        level: 1,
        title: 1,
        customTitle: 1,
        characteristics: 1,
        signature: 1
    },
    notificationPostProjection: {
        postType: 1,
        title: 1,
        _id: 1
    },
    notificationForumPostProjection: {
        title: 1,
        sectionId: 1
    },
    blogPostProjection: {
        title: 1,
        author: 1,
        cover: 1,
        content: 1,
        postType: 1,
        characteristics: 1,
        commentCount: { $size: '$comments'}
    }
};
