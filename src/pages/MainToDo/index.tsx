import React, { useState, useEffect, RefObject, useRef } from 'react';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { v4 as uuid } from 'uuid';
import Dexie from 'dexie';
import autoAnimate from '@formkit/auto-animate';

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

interface ISelectOption {
  value: ListSettingsStatus;
  label: string;
}

const useAutoAnimate = (ref: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    ref.current && autoAnimate(ref.current);
  }, [ref]);
};

const MainToDo: React.FC = () => {
  const { t } = useTranslation();

  const [allTodos, setAllTodos] = useState<ITodo[]>([]);
  const [activeTodos, setActiveTodos] = useState<number>(0);
  const [listSettings, setListSettings] = useState<ISelectOption>({
    value: ListSettingsStatus.all,
    label: t('allTodos')
  });
  const [typedTodo, setTypedTodo] = useState<string>('');
  const [needUpdate, setNeedUpdate] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<IIconChecked[]>([]);

  const parentRef = useRef(null);
  useAutoAnimate(parentRef);

  const db = new Dexie('TodoDB');
  db.version(1).stores({ listOfTodos: 'id,text,done' });

  const options: ISelectOption[] = [
    { value: ListSettingsStatus.all, label: t('allTodos') },
    { value: ListSettingsStatus.active, label: t('activeTodos') },
    { value: ListSettingsStatus.done, label: t('doneTodos') }
  ];

  const newTodo = (text: string): ITodo => {
    const todo: ITodo = {
      id: uuid(),
      text,
      done: false
    };

    return todo;
  };

  const handleKeyDown = async (event: React.KeyboardEvent): Promise<void> => {
    if (event.key === 'Enter' && typedTodo) {
      const todo = newTodo(typedTodo);
      await db.tables[0].add(todo);

      setTypedTodo('');

      setNeedUpdate(true);
    }
  };

  const changeDone = async (id: string): Promise<void> => {
    const todo: ITodo = await db.tables[0].get(id);
    await db.tables[0].update(id, { done: !todo.done });
    setNeedUpdate(true);
  };

  const deleteTodo = async (id: string): Promise<void> => {
    await db.tables[0].delete(id);
    setNeedUpdate(true);
  };

  const deleteAllTodo = async (): Promise<void> => {
    await db.tables[0].clear();
    setNeedUpdate(true);
  };

  const changeListSettings = (e: ISelectOption): void => {
    setListSettings(e);
  };

  useEffect(() => {
    db.tables[0].toArray().then((todos: ITodo[]) => {
      setAllTodos(todos);

      const active = todos.filter((todo: ITodo) => todo.done === false);
      setActiveTodos(active.length);
    });

    setNeedUpdate(false);
  }, [needUpdate]);

  const renderTodo = (item: ITodo): JSX.Element => {
    return (
      <div className={cn(styles.todo, item.done && styles.done)} key={item.id}>
        {item.done === false ? (
          <div
            onClick={() => changeDone(item.id)}
            onMouseEnter={() => setIsHovered([{ id: item.id, checked: true }])}
            onMouseLeave={() => setIsHovered([])}
            data-testid="done-button">
            <svg
              fill="#000000"
              width="800px"
              height="800px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              role="done-button">
              {isHovered.find((element) => element.id === item.id)?.checked && (
                <path
                  className="hoveredPath"
                  d="M17.28 9.28a.75.75 0 00-1.06-1.06l-5.97 5.97-2.47-2.47a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l6.5-6.5z"
                />
              )}
              <path
                fillRule="evenodd"
                d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM2.5 12a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z"
              />
            </svg>
          </div>
        ) : (
          <div onClick={() => changeDone(item.id)} data-testid="undone-button">
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
        <div className={styles.deleteIcon}>
          <svg
            onClick={() => deleteTodo(item.id)}
            width="800px"
            height="800px"
            viewBox="0 0 1024 1024"
            fill="#000000"
            className="icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            data-testid="delete-button">
            <path
              d="M512 897.6c-108 0-209.6-42.4-285.6-118.4-76-76-118.4-177.6-118.4-285.6 0-108 42.4-209.6 118.4-285.6 76-76 177.6-118.4 285.6-118.4 108 0 209.6 42.4 285.6 118.4 157.6 157.6 157.6 413.6 0 571.2-76 76-177.6 118.4-285.6 118.4z m0-760c-95.2 0-184.8 36.8-252 104-67.2 67.2-104 156.8-104 252s36.8 184.8 104 252c67.2 67.2 156.8 104 252 104 95.2 0 184.8-36.8 252-104 139.2-139.2 139.2-364.8 0-504-67.2-67.2-156.8-104-252-104z"
              fill=""
            />
            <path
              d="M707.872 329.392L348.096 689.16l-31.68-31.68 359.776-359.768z"
              fill=""
            />
            <path d="M328 340.8l32-31.2 348 348-32 32z" fill="" />
          </svg>
        </div>
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
            role="todoText"
            onChange={(e) => setTypedTodo(e.target.value)}
            placeholder={t('input.placeholder')}
            onKeyDown={handleKeyDown}
            value={typedTodo}
            data-testid="todoText"
          />
        </div>

        <div className={styles.ListOfTodos} ref={parentRef}>
          {listSettings.value === ListSettingsStatus.all && (
            <>{allTodos.map((item) => renderTodo(item))}</>
          )}

          {listSettings.value === ListSettingsStatus.active && (
            <>
              {allTodos.map((item) => item.done === false && renderTodo(item))}
            </>
          )}

          {listSettings.value === ListSettingsStatus.done && (
            <>
              {allTodos.map((item) => item.done === true && renderTodo(item))}
            </>
          )}
        </div>

        <div className={styles.ListSettings}>
          <div className={styles.itemsCount}>
            {activeTodos === 0
              ? t('noItems')
              : activeTodos === 1
              ? t('oneItem', { count: activeTodos })
              : activeTodos <= 4
              ? t('someItems', { count: activeTodos })
              : t('itemsCount', { count: activeTodos })}
          </div>

          <div className={styles.select} data-testid="select-dropdown">
            <Select
              defaultValue={listSettings}
              onChange={(e: ISelectOption | null) =>
                e !== null && changeListSettings(e)
              }
              options={options}
            />
          </div>

          <div className={styles.clearDoneTodos}>
            <button
              type="button"
              onClick={() => deleteAllTodo()}
              data-testid="deleteAll-button">
              {t('clearAll')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainToDo;
