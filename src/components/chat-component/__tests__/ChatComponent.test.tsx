import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import createChatDBClient, {
  dbClientReturnTypes,
} from '../services/localChatDBClient';
import ChatComponentWithContext from '..';

beforeAll(() => {
  global.indexedDB = new IDBFactory();
});

afterAll(() => {
  global.indexedDB = new IDBFactory();
});

// @ts-expect-error partial implementation for testing purposes
global.BroadcastChannel = function MockBroadcastChannel(name: string) {
  return {
    name,
    postMessage: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onmessage: null,
    onmessageerror: null,
  };
};

describe('ChatComponent Integration Tests', () => {
  let uniqueNamespace: string;
  let dbClient: dbClientReturnTypes;

  beforeEach(async () => {
    global.indexedDB = new IDBFactory();
    uniqueNamespace = `test-chat-${Date.now()}`;
    dbClient = await createChatDBClient({ nameSpace: uniqueNamespace });
    jest.clearAllMocks();
  });

  test('should add a new comment and display it in the timeline', async () => {
    const COMMENT = 'comment for "add" test';
    await act(async () => {
      render(
        <ChatComponentWithContext
          nameSpace={uniqueNamespace}
          userName='Test User'
        />
      );
    });

    expect(screen.queryByText(`/${COMMENT}/`)).not.toBeInTheDocument();
    const textInput = screen.getByPlaceholderText('Type your comment here...');
    await act(async () =>
      fireEvent.change(textInput, { target: { value: COMMENT } })
    );
    await act(async () => fireEvent.click(screen.getByText('Comment')));
    await waitFor(() => expect(screen.getByText(COMMENT)).toBeInTheDocument());
    const timeline = await dbClient.getChatTimeline();
    expect(timeline.length).toBe(1);
    expect(timeline[0].body).toBe(COMMENT);
  });

  test('should delete a comment when delete button is clicked', async () => {
    const COMMENT = 'Comment to delete';
    await dbClient.addComment({
      body: COMMENT,
      timeStamp: new Date().toISOString(),
      sender: 'Test User',
      parent: undefined,
      deleted: false,
    });

    await act(async () => {
      render(
        <ChatComponentWithContext
          nameSpace={uniqueNamespace}
          userName='Test User'
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText(COMMENT)).toBeInTheDocument();
    });
    const commentElement = screen.getByText(COMMENT);
    const commentContainer = commentElement.closest('div');
    if (!commentContainer) throw new Error('Comment container not found');
    const deleteButton = within(commentContainer).getByText('delete');

    if (!deleteButton) throw new Error('Delete button not found');
    await act(async () => fireEvent.click(deleteButton));
    await waitFor(() =>
      expect(screen.queryByText(COMMENT)).not.toBeInTheDocument()
    );
    const timeline = await dbClient.getChatTimeline();
    expect(timeline.length).toBe(0);
  });

  test('should allow replying to a comment', async () => {
    const PARENT_COMMENT = 'Parent comment';
    const REPLY_COMMENT = 'This is a reply';

    const parentId = Number(
      await dbClient.addComment({
        body: PARENT_COMMENT,
        timeStamp: new Date().toISOString(),
        sender: 'Test User',
        parent: undefined,
        deleted: false,
      })
    );

    await act(async () => {
      render(
        <ChatComponentWithContext
          nameSpace={uniqueNamespace}
          userName='Test User'
        />
      );
    });

    await waitFor(() =>
      expect(screen.getByText(PARENT_COMMENT)).toBeInTheDocument()
    );
    const commentElement = screen.getByText(PARENT_COMMENT);
    const commentContainer = commentElement.closest('div');
    if (!commentContainer) throw new Error('Comment container not found');

    const replyButton = within(commentContainer).getByText('reply');
    if (!replyButton) throw new Error('Reply button not found');
    await act(async () => fireEvent.click(replyButton));

    const inputs = screen.getAllByPlaceholderText('Type your comment here...');
    expect(inputs.length).toBeGreaterThan(1);

    const replyInput = inputs[inputs.length - 1];
    await act(async () => {
      fireEvent.change(replyInput, { target: { value: REPLY_COMMENT } });
    });

    const replyContainer = replyInput.closest('div');
    if (!replyContainer) throw new Error('Reply container not found');

    const replyCommentButton = replyContainer.querySelector('button');
    if (!replyCommentButton) throw new Error('Reply comment button not found');

    await act(async () => fireEvent.click(replyCommentButton));
    await waitFor(() =>
      expect(screen.getByText(REPLY_COMMENT)).toBeInTheDocument()
    );

    const timeline = await dbClient.getChatTimeline();
    expect(timeline.length).toBe(1);
    expect(timeline[0].children.length).toBe(1);
    expect(timeline[0].children[0].body).toBe(REPLY_COMMENT);
    expect(timeline[0].children[0].parent).toBe(parentId);
  });

  test('should display all comments from the database on load', async () => {
    await dbClient.addComment({
      body: 'First comment',
      timeStamp: new Date().toISOString(),
      sender: 'Test User',
      parent: undefined,
      deleted: false,
    });

    await dbClient.addComment({
      body: 'Second comment',
      timeStamp: new Date().toISOString(),
      sender: 'Test User',
      parent: undefined,
      deleted: false,
    });

    const parentId = Number(
      await dbClient.addComment({
        body: 'Parent with reply',
        timeStamp: new Date().toISOString(),
        sender: 'Test User',
        parent: undefined,
        deleted: false,
      })
    );

    await dbClient.addComment({
      body: 'Child comment',
      timeStamp: new Date().toISOString(),
      sender: 'Test User',
      parent: parentId,
      deleted: false,
    });

    await act(async () => {
      render(
        <ChatComponentWithContext
          nameSpace={uniqueNamespace}
          userName='Test User'
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('First comment')).toBeInTheDocument();
      expect(screen.getByText('Second comment')).toBeInTheDocument();
      expect(screen.getByText('Parent with reply')).toBeInTheDocument();
      expect(screen.getByText('Child comment')).toBeInTheDocument();
    });
  });
});
