import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { nanoid } from 'nanoid';
import { initDB, useIndexedDB } from 'react-indexed-db-hook';

import { DBConfig } from '../../configs/DBConfig';

import styles from './styles.module.css';

interface ITodo {
  id: string;
  text: string;
  done: boolean;
}

interface IIconChecked {
  id: string;
  checked: boolean;
}

enum ListSettingsStatus {
  all = 'ALL',
  active = 'ACTIVE',
  done = 'DONE'
}

initDB(DBConfig);

const MainToDo: React.FC = () => {
  const [allTodos, setAllTodos] = useState<ITodo[]>([]);
  const [listSettings, setListSettings] = useState<ListSettingsStatus>(
    ListSettingsStatus.all
  );
  const [typedTodo, setTypedTodo] = useState<string>('');
  const [needUpdate, setNeedUpdate] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<IIconChecked[]>([]);

  const { getAll, add, getByID, update } = useIndexedDB('todos');

  const [t] = useTranslation();

  const newTodo = (text: string) => {
    const todo: ITodo = {
      id: nanoid(8),
      text,
      done: false
    };

    return todo;
  };

  const handleKeyDown = async (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && typedTodo) {
      const todo = newTodo(typedTodo);
      await add(todo).then(
        (e) => {
          console.log('ID Generated: ', e);
        },
        (error) => {
          console.log(error);
        }
      );

      setNeedUpdate(true);
    }
  };

  const changeDone = async (id: string) => {
    const todo: ITodo = await getByID(id);
    await update({ ...todo, done: !todo.done });
    setNeedUpdate(true);
  };

  useEffect(() => {
    getAll().then((todos) => {
      setAllTodos(todos);
    });

    console.log(allTodos);

    setNeedUpdate(false);
  }, [needUpdate]);

  const renderTodo = (item: ITodo): JSX.Element => {
    return (
      <div className={cn(styles.todo, item.done && styles.done)} key={item.id}>
        {item.done === false ? (
          <div
            onClick={() => changeDone(item.id)}
            onMouseEnter={() => setIsHovered([{ id: item.id, checked: true }])}
            onMouseLeave={() => setIsHovered([])}>
            <svg
              fill="#000000"
              width="800px"
              height="800px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              {isHovered.find((element) => element.id === item.id)?.checked && (
                <path d="M17.28 9.28a.75.75 0 00-1.06-1.06l-5.97 5.97-2.47-2.47a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l6.5-6.5z" />
              )}
              <path
                fillRule="evenodd"
                d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM2.5 12a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z"
              />
            </svg>
          </div>
        ) : (
          <div onClick={() => changeDone(item.id)}>
            <svg
              fill="#000000"
              width="800px"
              height="800px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M17.28 9.28a.75.75 0 00-1.06-1.06l-5.97 5.97-2.47-2.47a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l6.5-6.5z" />
              <path
                fillRule="evenodd"
                d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM2.5 12a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z"
              />
            </svg>
          </div>
        )}
        <p>{item.text}</p>
      </div>
    );
  };

  return (
    <>
      <div className={styles.MainWindow}>
        <div className={styles.InputField}>
          <input
            type="text"
            name="todoText"
            onChange={(e) => setTypedTodo(e.target.value)}
            placeholder={t('input.placeholder')}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={styles.ListOfTodos}>
          {listSettings === ListSettingsStatus.all && (
            <>{allTodos.map((item) => renderTodo(item))}</>
          )}

          {listSettings === ListSettingsStatus.active && (
            <>
              {allTodos.map((item) => item.done === false && renderTodo(item))}
            </>
          )}

          {listSettings === ListSettingsStatus.done && (
            <>
              {allTodos.map((item) => item.done === true && renderTodo(item))}
            </>
          )}
        </div>

        <div className={styles.ListSettings}></div>
      </div>
    </>
  );
};

export default MainToDo;
