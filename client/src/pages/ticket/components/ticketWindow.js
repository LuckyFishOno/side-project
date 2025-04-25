import TicketBasic from './ticketBasic'
import TicketInfo from './ticketInfo'
import TicketAdvanced from './ticketAdvanced'
import TicketLog from './ticketLog'
import { useState, useEffect } from 'react';

const TicketWindow = () => {
    const [activeTab, setActiveTab] = useState('Basic');
    const [event, setEvent] = useState(false);
    const [allTicketData, setAllTicketData] = useState({});
    const [dataCollected, setDataCollected] = useState(false);
    const [fontState, setFontState] = useState(true);
    const [cancel, setCancel] = useState([]);
    const [run, setRun] = useState(0);
    const [success, setSuccess] = useState([{}]);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const eventStart = () => {
        if(run > 0){
            alert('Bot Run');
        } else {
            setEvent(true);
            setDataCollected(false); 
            setFontState(false);
        }
            
        setRun(function(prev) {
            return prev + 1;
        })
    };

    //r4buqkhp8k0n7kgm72r5rpr7hh 25_chihsiou

    const eventCancel = () => {
        setCancel(['botStop']);
        setRun(0);
        setFontState(true);
    };

    useEffect(() => {
        if (cancel.length > 0) {
            const sendDataToBackend = async (cancel) => {
                console.log('準備發送的合併資料:', cancel);
        
                try {
                    const response = await fetch('http://localhost:4000/api/ticket/3', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(cancel)
                    }).then(response => {
                        console.log('Cancel Information Add');
                        return response;
                    });
        
                    if (response.ok) {
                        const responseData = await response.json();
                        console.log('資料發送成功:', responseData);
                    } else {
                        console.error('資料發送失敗:', response.status);
                    }
                } catch (error) {
                    console.error('發送資料時發生錯誤:', error);
                } 
            };

            sendDataToBackend(cancel);
            setCancel([]);
        }
    }, [cancel]);

    useEffect(() => {
        if (dataCollected) {
            const sendDataToBackend = async (allTicketData) => {
                console.log('準備發送的合併資料:', allTicketData);
        
                try {
                    const response = await fetch('http://localhost:4000/api/ticket/1', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(allTicketData)
                    }).then(response => {
                        console.log('New Ticket Information Add');
                        return response;
                    });
        
                    if (response.ok) {
                        const responseData = await response.json();
                        console.log('資料發送成功:', responseData);
                    } else {
                        console.error('資料發送失敗:', response.status);
                    }
                } catch (error) {
                    console.error('發送資料時發生錯誤:', error);
                } finally {
                    setEvent(false); 
                }
            };

            sendDataToBackend(allTicketData);
            setDataCollected(false);
            setCancel([]);
        }
    }, [dataCollected, allTicketData]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            //console.log('Polling success status...');
            fetch('http://localhost:4000/api/ticket/3').then(
                response => response.json()
            ).then(
                data => {
                    if (data.message === 'buySuccess') {
                        setSuccess(data);
                        clearInterval(intervalId); // 成功後停止輪詢
                    }
                }
            ).catch(error => {
                console.error('Error polling success status:', error);
            });
        }, 3000); // 每 5 秒輪詢一次 (您可以調整這個時間)
    
        return () => clearInterval(intervalId); // 組件卸載時清除定時器
    }, []);

    const getBasicData = (Data) => {
        setAllTicketData(prevData => ({ ...prevData, basic: Data }));
    };

    const getInfoData = (Data) => {
        setAllTicketData(prevData => ({ ...prevData, info: Data }));
    };

    const getAdvancedData = (Data) => {
        setAllTicketData(prevData => ({ ...prevData, advanced: Data }));
    };

    useEffect(() => {
        if (event) {
            if (allTicketData.basic && allTicketData.info && allTicketData.advanced) {
                setDataCollected(true);
            }
        }
    }, [event, allTicketData]);

    useEffect(() => {
        console.log('Second useEffect triggered. Success state:', success);
        if (success.message === 'buySuccess') { // 確保 success 不是 null 或 undefined
            console.log('Buy success detected!');
            setRun(0);
            setFontState(true);
            setSuccess([{}]);
        }
    }, [success]);

    return <div>
        <nav className='navBar'>
            <button style={{'textShadow': activeTab === 'Basic' ? '0px 0px 5px #fff' : 'none', 'fontSize': activeTab === 'Basic' ? '20px' : '17px'}} onClick={() => handleTabClick('Basic')} >Basic</button>
            <button style={{'textShadow': activeTab === 'Info' ? '0px 0px 5px #fff' : 'none', 'fontSize': activeTab === 'Info' ? '20px' : '17px'}}onClick={() => handleTabClick('Info')}>Info</button>
            <button style={{'textShadow': activeTab === 'Advanced' ? '0px 0px 5px #fff' : 'none', 'fontSize': activeTab === 'Advanced' ? '20px' : '17px'}}onClick={() => handleTabClick('Advanced')}>Advanced</button>
        </nav>
        <div className='info-container'>
            <TicketBasic chg={activeTab} start={event} onGetBasicData={getBasicData} stateChg={fontState}/>
            <TicketInfo chg={activeTab} start={event} onGetInfoData={getInfoData} stateChg={fontState}/>
            <TicketAdvanced chg={activeTab} start={event} onGetAdvancedData={getAdvancedData} stateChg={fontState}/>
            <TicketLog/>
        </div>
        <div className='btnEvent'>
            <button onClick={eventStart}>Start</button>
            <button onClick={eventCancel}>Stop</button>
        </div>
    </div>
}

export default TicketWindow;