import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/configureStore';
import {
  ReservationState,
  SelectDateProps,
  SingleSelectProps,
  MultiSelectorProps,
} from '../../types/reservation';
import { updateReservationInfo } from '../../reducers/reservation';

import { ReactComponent as Check } from '../../assets/Check.svg';

import styles from './reservationOptions.module.scss';
import AlertModal from './AlertModal';

const DateOptions: React.FC = () => {
  const getCurrentYear = () => {
    const today = new Date();
    return today.getFullYear().toString();
  };

  const getWeekdayDates = () => {
    const today = new Date();
    const day = today.getDay();
    const hours = today.getHours();

    const isFridayAfterSixPm = day === 5 && hours >= 18;
    const isSaturday = day === 6;

    // 금요일 오후 6시 이후 또는 토요일(6)인 경우
    if (isFridayAfterSixPm || isSaturday) {
      const nextMonday = new Date(today);
      nextMonday.setDate(
        today.getDate() + (8 - day) + (isFridayAfterSixPm ? 3 : 2),
      ); // 다음 주 월요일로 이동

      const weekDates = Array.from({ length: 5 }, (_, index) => {
        const date = new Date(nextMonday);
        date.setDate(nextMonday.getDate() + index);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dayOfWeek = ['월', '화', '수', '목', '금'][index];
        return `${year}-${month}-${day}(${dayOfWeek})`;
      });

      return weekDates;
    } else if (day === 0) {
      // 일요일(0)인 경우
      const currentMonday = new Date(today);
      currentMonday.setDate(today.getDate() + (1 - day)); // 해당 주 월요일로 이동

      const weekDates = Array.from({ length: 5 }, (_, index) => {
        const date = new Date(currentMonday);
        date.setDate(currentMonday.getDate() + index);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dayOfWeek = ['월', '화', '수', '목', '금'][index];
        return `${year}-${month}-${day}(${dayOfWeek})`;
      });

      return weekDates;
    } else {
      const currentMonday = new Date(today);
      currentMonday.setDate(today.getDate() + (1 - day)); // 해당 주 월요일로 이동

      const weekDates = Array.from({ length: 5 }, (_, index) => {
        const date = new Date(currentMonday);
        date.setDate(currentMonday.getDate() + index);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dayOfWeek = ['월', '화', '수', '목', '금'][index];
        return `${year}-${month}-${day}(${dayOfWeek})`;
      });

      return weekDates;
    }
  };

  const SelectDate: React.FC<SelectDateProps> = ({
    label,
    changeHandler,
    selectedCheckbox,
  }) => (
    <>
      <input
        type='radio'
        name='dateSelector'
        id={label}
        onChange={changeHandler}
        className={styles.checkboxInput}
        checked={selectedCheckbox === label}
      />
      <label htmlFor={label} className={styles.checkboxLabel}>
        {selectedCheckbox === label && <Check />}
      </label>
    </>
  );

  const DateDisplay: React.FC = () => {
    const currentDate = getCurrentYear();
    const weekDates = getWeekdayDates();

    return (
      <section className={styles.dateContainer}>
        <time className={styles.currentDate}>{currentDate}</time>
        <div className={styles.date}>
          {weekDates.map((date, index) => (
            <time key={index}>{date.slice(5).replace(/-/g, '.')}</time>
          ))}
        </div>
      </section>
    );
  };

  const SelectDateContainer: React.FC = () => {
    const [isPastDate, setIsPastDate] = useState(false);

    const reservationInfo = useSelector(
      (state: RootState) => state.reservation,
    );
    const dispatch = useDispatch();
    const updateReservation = (updatedInfo: Partial<ReservationState>) => {
      const updatedReservationInfo = {
        ...reservationInfo,
        ...updatedInfo,
      };

      dispatch(updateReservationInfo(updatedReservationInfo));
    };

    const [selectedCheckbox, setSelectedCheckbox] = useState(
      reservationInfo.reservation_date,
    );

    const handleSelectedDateChange = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const selectedDate = e.target.id;
      console.log(selectedDate);
      const weekDates = getWeekdayDates();
      const notIncludeDay = weekDates.map(date => date.split('(')[0]);
      const index = notIncludeDay.indexOf(selectedDate);

      // 오늘 날짜와 선택한 날짜를 비교하여 이전 날짜인 경우에만 alert 메시지를 띄웁니다.
      const currentDate = new Date();
      const clickedDate = new Date(weekDates[index]);
      if (clickedDate < currentDate && clickedDate !== currentDate) {
        setIsPastDate(true);
        return;
      }

      setSelectedCheckbox(weekDates[index]);
      updateReservation({
        reservation_date: notIncludeDay[index],
      });
    };

    return (
      <div className={styles.checkbox}>
        {getWeekdayDates().map(day => (
          <SelectDate
            key={day.slice(0, -3)}
            label={day.slice(0, -3)}
            selectedCheckbox={selectedCheckbox}
            changeHandler={handleSelectedDateChange}
          />
        ))}
        {isPastDate && (
          <AlertModal
            modalMessage1='지난 날짜에는 예약이 불가합니다.🥹'
            onClick={() => setIsPastDate(false)}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <DateDisplay />
      <SelectDateContainer />
    </>
  );
};

export const SingleSelect: React.FC<SingleSelectProps> = ({
  typeList,
  name,
  onSelect,
}) => {
  const [selectedType, setSelectedType] = useState<string>(typeList[0]);

  const handleSelect = (type: string) => {
    if (onSelect) {
      onSelect(type);
    }
    setSelectedType(type);
  };

  return (
    <div className={styles.typeSelector}>
      {typeList.map(type => (
        <label
          key={type}
          className={
            selectedType === type ? styles.checkedType : styles.unCheckedType
          }
        >
          <input
            type='radio'
            name={name}
            value={type}
            checked={selectedType === type}
            onChange={() => handleSelect(type)}
            className={styles.checkboxInput}
          />
          {type}
        </label>
      ))}
    </div>
  );
};

const TimeSelector: React.FC<MultiSelectorProps> = ({ typeList }) => {
  const [isClicked, setIsClicked] = useState<boolean[]>(
    typeList.map((_, index) => index === 0),
  );
  const [isPastTime, setIsPastTime] = useState(false);

  const reservationInfo = useSelector((state: RootState) => state.reservation);
  const dispatch = useDispatch();

  const updateReservation = (
    updatedInfo: Partial<ReservationState> & { date?: string },
  ) => {
    const updatedReservationInfo = {
      ...reservationInfo,
      ...updatedInfo,
    };
    dispatch(updateReservationInfo(updatedReservationInfo));
  };

  useEffect(() => {
    // 최소 한 개의 항목이 선택되도록 처리
    const clickedCount = isClicked.filter(Boolean).length;
    if (clickedCount === 0) {
      const updatedClickedState = [...isClicked];
      updatedClickedState[0] = true;
      setIsClicked(updatedClickedState);
    }
    const selectedTimes = typeList.filter((_, index) => isClicked[index]);
    const time = selectedTimes.join(', ');
    updateReservation({ time: time });
  }, [isClicked]);

  useEffect(() => {
    // 초기 렌더링 시 reservationInfo.time과 동일한 항목을 선택한 상태로 설정
    const initialSelectedIndex = typeList.findIndex(
      time => time === reservationInfo.time,
    );
    if (initialSelectedIndex !== -1) {
      const updatedClickedState = typeList.map(
        (_, index) => index === initialSelectedIndex,
      );
      setIsClicked(updatedClickedState);
    }
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    const selectedDate = new Date(reservationInfo.reservation_date);

    const isPreviousOrSameDay =
      currentDate.toDateString() >= selectedDate.toDateString();

    if (isPreviousOrSameDay) {
      const getTime = (): string => {
        const currentHour = new Date().getHours();

        if (currentHour >= 10 && currentHour < 14) {
          return '14:00~18:00';
        } else if (currentHour >= 14 && currentHour < 18) {
          return '18:00~22:00';
        } else {
          return '10:00~14:00';
        }
      };
      const initialSelectedIndex = typeList.findIndex(
        time => time === getTime(),
      );
      if (initialSelectedIndex !== -1) {
        const updatedClickedState = typeList.map(
          (_, index) => index === initialSelectedIndex,
        );
        setIsClicked(updatedClickedState);
      }
      updateReservation({ time: getTime() });
    }
  }, [reservationInfo.reservation_date]);

  const handleTimeClick = (index: number, time: string) => {
    const currentDate = new Date();
    const selectedDate = new Date(reservationInfo.reservation_date);
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    const isSameDay = selectedDate <= currentDate;

    console.log(isSameDay);

    const currentTime = new Date().getHours();
    const [startHour] = time.split(':');
    const startTime = Number(startHour);

    // 선택한 당일인 경우 선택한 시간과 현재 시간 비교
    if (isSameDay) {
      if (startTime <= currentTime) {
        // 선택한 시간이 현재 시간을 지났을 경우 클릭 이벤트 실행해 모당창을 띄웁니다.
        setIsPastTime(true);
        return;
      }
    }

    const updatedClickedState = [...isClicked];
    updatedClickedState[index] = !updatedClickedState[index];
    setIsClicked(updatedClickedState);
  };

  return (
    <div className={styles.TimeSelector}>
      {typeList.map((type, index) => (
        <button
          key={type}
          className={
            isClicked[index] ? styles.checkedType : styles.unCheckedType
          }
          onClick={() => handleTimeClick(index, type)}
        >
          {type}
        </button>
      ))}
      {isPastTime && (
        <AlertModal
          modalMessage1='지난 시간을 예약하실 수 없습니다.🥹'
          onClick={() => setIsPastTime(false)}
        />
      )}
    </div>
  );
};

const ReservationOptions: React.FC = () => {
  const seatTypeList: string[] = ['개인석', '팀플석', '수료기수석', '미팅룸'];
  const TimeList = ['10:00~14:00', '14:00~18:00', '18:00~22:00'];
  const [isMeetingRoom, setIsMeetingRoom] = useState<boolean>(false);
  const [isPastTime, setIsPastTime] = useState<boolean>(false);

  const reservationInfo = useSelector((state: RootState) => state.reservation);
  const dispatch = useDispatch();

  const updateReservation = (updatedInfo: Partial<ReservationState>) => {
    const updatedReservationInfo = {
      ...reservationInfo,
      ...updatedInfo,
    };
    dispatch(updateReservationInfo(updatedReservationInfo));
  };

  const handleSeatTypeSelect = (value: string) => {
    if (value === '미팅룸') {
      updateReservation({ seat_type: value, seat_number: 'A' });
      setIsMeetingRoom(true);
    } else {
      setIsMeetingRoom(false);
      updateReservation({ seat_type: value });
    }
  };

  const handleMeetingRoomTimeSelect = (value: string) => {
    updateReservation({ time: value });
    const currentTime = new Date().getHours();
    const [startHour] = value.split(':');
    const startTime = Number(startHour);

    const isPastDate = (reservationDate: string): boolean => {
      const today = new Date();

      const year = today.getFullYear();
      const month = today.getMonth();
      const day = today.getDate();

      const currentDate = `${year}.${month.toString().padStart(2, '0')}.${day
        .toString()
        .padStart(2, '0')}`;

      return currentDate >= reservationDate;
    };

    // 선택한 날짜가 지난 경우 선택한 시간과 현재 시간 비교
    if (isPastDate(reservationInfo.reservation_date)) {
      if (startTime <= currentTime) {
        // 선택한 시간이 현재 시간을 지났을 경우 클릭 이벤트 실행하지 않음
        setIsPastTime(true);
        return;
      }
    }
  };

  return (
    <>
      <DateOptions />
      <SingleSelect
        typeList={seatTypeList}
        name='seatType'
        onSelect={handleSeatTypeSelect}
      />
      {!isMeetingRoom ? (
        <TimeSelector typeList={TimeList} />
      ) : (
        <div className={styles.meetingRoomTimeSelector}>
          <SingleSelect
            typeList={TimeList}
            name='time'
            onSelect={handleMeetingRoomTimeSelect}
          />
        </div>
      )}
      {isPastTime && (
        <AlertModal
          modalMessage1='지난 시간을 예약하실 수 없습니다.🥹'
          onClick={() => setIsPastTime(false)}
        />
      )}
    </>
  );
};

export default ReservationOptions;
