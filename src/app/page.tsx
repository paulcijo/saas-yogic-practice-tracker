"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Check, X, AlertCircle, Edit, Trash, ChevronDown, ChevronUp, MoveUp, MoveDown, Calendar, Award, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const YogicPracticeTracker = () => {
  const [practices, setPractices] = useState([]);
  const [newPractice, setNewPractice] = useState({ name: '', type: 'counter', category: 'Asana' });
  const [notification, setNotification] = useState(null);
  const [expandedPractice, setExpandedPractice] = useState(null);
  const [showTour, setShowTour] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    const storedPractices = localStorage.getItem('yogicPractices');
    if (storedPractices) {
      setPractices(JSON.parse(storedPractices));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('yogicPractices', JSON.stringify(practices));
  }, [practices]);

  const addPractice = () => {
    if (newPractice.name.trim() === '') return;
    setPractices([...practices, { ...newPractice, streak: 0, lastCompleted: null, value: 0, history: [] }]);
    setNewPractice({ name: '', type: 'counter', category: 'Asana' });
    showNotification("New practice added successfully!");
  };

  const updatePractice = (index, value) => {
    const updatedPractices = [...practices];
    const practice = updatedPractices[index];
    const today = new Date().toDateString();

    if (today === practice.lastCompleted) {
      if (practice.type === 'counter') {
        practice.value = (practice.value || 0) + value;
      }
    } else {
      practice.streak = practice.lastCompleted === getPreviousDay(today) ? practice.streak + 1 : 1;
      practice.lastCompleted = today;
      practice.value = practice.type === 'counter' ? value : 'Done';
    }

    practice.history.push({ date: today, value: practice.value });

    setPractices(updatedPractices);
    showNotification(`${practice.name} updated!`);
    checkStreakMilestone(practice);
  };

  const getPreviousDay = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return date.toDateString();
  };

  const checkMissedPractice = (index) => {
    const updatedPractices = [...practices];
    const practice = updatedPractices[index];
    const today = new Date().toDateString();

    if (practice.lastCompleted !== today && practice.lastCompleted !== getPreviousDay(today)) {
      practice.streak = 0;
      showNotification(`${practice.name} streak reset.`);
    } else {
      showNotification(`${practice.name} is up to date.`);
    }

    setPractices(updatedPractices);
  };

  const deletePractice = (index) => {
    if (window.confirm("Are you sure you want to delete this practice?")) {
      const updatedPractices = practices.filter((_, i) => i !== index);
      setPractices(updatedPractices);
      showNotification("Practice deleted successfully.");
    }
  };

  const editPractice = (index, updatedPractice) => {
    const updatedPractices = [...practices];
    updatedPractices[index] = { ...updatedPractices[index], ...updatedPractice };
    setPractices(updatedPractices);
    showNotification("Practice updated successfully.");
  };

  const movePractice = (index, direction) => {
    const updatedPractices = [...practices];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < updatedPractices.length) {
      [updatedPractices[index], updatedPractices[newIndex]] = [updatedPractices[newIndex], updatedPractices[index]];
      setPractices(updatedPractices);
      showNotification(`${practices[index].name} moved ${direction}.`);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const checkStreakMilestone = (practice) => {
    const milestones = [7, 30, 100, 365];
    if (milestones.includes(practice.streak)) {
      showNotification(`Congratulations! You've reached a ${practice.streak}-day streak for ${practice.name}!`);
    }
  };

  const renderPracticeCard = (practice, index) => (
    <Card
      key={index}
      className="bg-white shadow-md rounded-lg overflow-hidden mb-4 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => setExpandedPractice(expandedPractice === index ? null : index)}
    >
      <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-500 p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-white flex items-center">
            {practice.category === 'Asana' && <Award className="mr-2" size={24} />}
            {practice.category === 'Pranayama' && <Bell className="mr-2" size={24} />}
            {practice.category === 'Meditation' && <Calendar className="mr-2" size={24} />}
            {practice.name}
          </CardTitle>
          <div className="flex items-center space-x-2 text-white">
            <span className="text-2xl font-bold">{practice.streak}</span>
            <span className="text-sm">days</span>
            {expandedPractice === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className={`p-4 ${expandedPractice === index ? 'block' : 'hidden'}`}>
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">Last completed: {practice.lastCompleted || 'Never'}</p>
          <Button
            onClick={(e) => { e.stopPropagation(); checkMissedPractice(index); }}
            className="bg-purple-500 hover:bg-purple-600 text-white text-sm py-1 px-3 rounded-full"
          >
            Check Streak
          </Button>
        </div>
        <Progress value={practice.streak} max={30} className="mb-4" />
        {practice.type === 'counter' ? (
          <div className="flex items-center justify-between">
            <Button
              onClick={(e) => { e.stopPropagation(); updatePractice(index, 1); }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
            >
              Increment
            </Button>
            <Input
              type="number"
              value={practice.value || 0}
              onChange={(e) => { e.stopPropagation(); editPractice(index, { value: parseInt(e.target.value) || 0 }); }}
              className="w-20 text-center rounded-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <Button
            onClick={(e) => { e.stopPropagation(); updatePractice(index, 'Done'); }}
            className={`w-full ${practice.value === 'Done' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded-full`}
          >
            {practice.value === 'Done' ? <Check className="mr-2" /> : null}
            {practice.value === 'Done' ? 'Completed' : 'Mark as Done'}
          </Button>
        )}
        <div className="flex justify-end mt-4 space-x-2">
          <Button onClick={(e) => { e.stopPropagation(); editPractice(index, { name: prompt('Enter new name:', practice.name) }); }} className="rounded-full">
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button onClick={(e) => { e.stopPropagation(); deletePractice(index); }} className="bg-red-500 hover:bg-red-600 rounded-full">
            <Trash className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderWeeklyCalendar = () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const week = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day.toDateString();
    });

    return (
      <div className="grid grid-cols-7 gap-2 mb-4">
        {week.map((date) => (
          <div key={date} className="text-center">
            <div className="text-sm font-semibold">{date.slice(0, 3)}</div>
            <div className="mt-2">
              {practices.map((practice, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 mx-auto rounded-full ${practice.lastCompleted === date
                    ? `bg-${practice.category === 'Asana' ? 'purple' : practice.category === 'Pranayama' ? 'pink' : 'blue'}-500`
                    : 'bg-gray-200'
                    }`}
                  title={practice.name}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProgressChart = () => {
    const data = practices.map(practice => ({
      name: practice.name,
      streak: practice.streak,
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="streak" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl bg-gradient-to-br from-purple-100 to-pink-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-800">Yogic Practice Tracker</h1>

      {notification && (
        <Alert className="mb-4 bg-green-100 border-green-400 text-green-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      )}

      {showTour && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          <p className="font-bold">Welcome to Yogic Practice Tracker!</p>
          <p>Click on a practice to expand it and update your progress. Use the 'Add New Practice' button to get started.</p>
          <Button onClick={() => setShowTour(false)} className="mt-2 bg-blue-500 hover:bg-blue-600">Got it!</Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-purple-200">
          <TabsTrigger value="daily" className="data-[state=active]:bg-purple-400">Daily View</TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-purple-400">Weekly Calendar</TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-purple-400">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <div className="space-y-4">
            {practices.map((practice, index) => renderPracticeCard(practice, index))}
          </div>
        </TabsContent>
        <TabsContent value="weekly">
          {renderWeeklyCalendar()}
        </TabsContent>
        <TabsContent value="progress">
          {renderProgressChart()}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mb-8">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110">
              <Plus className="mr-2" /> Add New Practice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-purple-50">
            <DialogHeader>
              <DialogTitle>Add New Practice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Practice name"
                value={newPractice.name}
                onChange={(e) => setNewPractice({ ...newPractice, name: e.target.value })}
                className="col-span-3"
              />
              <Select
                value={newPractice.type}
                onValueChange={(value) => setNewPractice({ ...newPractice, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select practice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="counter">Counter</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newPractice.category}
                onValueChange={(value) => setNewPractice({ ...newPractice, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asana">Asana</SelectItem>
                  <SelectItem value="Pranayama">Pranayama</SelectItem>
                  <SelectItem value="Meditation">Meditation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addPractice}>Add Practice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default YogicPracticeTracker;