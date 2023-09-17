import { describe, expect } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import userEvent from '@testing-library/user-event';

import MainToDo from '../pages/MainToDo';

import '../locale/i18n';

describe('General tests', () => {
  it('check text without todos', async () => {
    await act(async () => {
      render(<MainToDo />);
    });
    const linkElement = await screen.findByText('All tasks completed!');
    expect(linkElement).toBeInTheDocument();
  });

  it('check placeholder on Input', async () => {
    await act(async () => {
      render(<MainToDo />);
    });

    const linkElement = await screen.findByPlaceholderText(
      'What needs to be done?'
    );
    expect(linkElement).toBeInTheDocument();
  });

  beforeEach(async () => {
    const db = new Dexie('TodoDB');
    db.version(1).stores({ listOfTodos: 'id,text,done' });
    const todo = { id: 'abc', text: 'First todo', done: false };
    db.tables[0].add(todo);

    await db.tables[0].toArray().then((todos) => {
      console.log(todos);
    });
  });

  it('adding new todo', async () => {
    await act(async () => {
      render(<MainToDo />);
    });

    const inputNode = await screen.findByPlaceholderText(
      'What needs to be done?'
    );

    await act(async () => {
      userEvent.type(inputNode, 'This is test todo item');
      userEvent.type(inputNode, '{enter}');
    });

    const taskNode = await screen.findByText('This is test todo item');

    expect(taskNode).toBeInTheDocument();
  });

  it('setting Done', async () => {
    await act(async () => {
      render(<MainToDo />);
    });

    const todoNode = await screen.findAllByTestId('done-button');
    expect(todoNode.length).toEqual(2);

    await act(async () => {
      userEvent.click(todoNode[1]);
    });

    const todoNodeAfterDone = await screen.findAllByTestId('undone-button');

    expect(todoNodeAfterDone.length).toEqual(1);
  });

  it('checking active Todos and clicking to delete', async () => {
    await act(async () => {
      render(<MainToDo />);
    });

    const countNode = await screen.findByText('1 item left');
    expect(countNode).toBeInTheDocument();

    const deletingNode = await screen.findAllByTestId('delete-button');

    await act(async () => {
      userEvent.click(deletingNode[0]);
    });
  });

  it('deleting single Todo', async () => {
    await act(async () => {
      render(<MainToDo />);
    });

    const todoNodeAfterDone = await screen.findAllByTestId('delete-button');
    expect(todoNodeAfterDone.length).toEqual(1);
  });

  it('deleting all Todos', async () => {
    await act(async () => {
      render(<MainToDo />);
    });

    const deleteAllNode = await screen.findByTestId('deleteAll-button');

    await act(async () => {
      userEvent.click(deleteAllNode);
    });

    const todoNodeAfterDeleteAll = await screen.findByText(
      'All tasks completed!'
    );
    expect(todoNodeAfterDeleteAll).toBeInTheDocument();
  });
});
