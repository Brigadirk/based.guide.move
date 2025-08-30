"use client"

import { useState } from "react"

export function useTabStates() {
  // Individual tab states for each section (isolated to prevent bleeding)
  const [degreesTab, setDegreesTab] = useState("you")
  const [skillsTab, setSkillsTab] = useState("you")
  const [workExpTab, setWorkExpTab] = useState("you")
  const [licensesTab, setLicensesTab] = useState("you")
  const [militaryTab, setMilitaryTab] = useState("you")
  const [studyPlansTab, setStudyPlansTab] = useState("you")
  const [schoolOffersTab, setSchoolOffersTab] = useState("you")
  const [learningGoalsTab, setLearningGoalsTab] = useState("you")
  const [otherLanguagesTab, setOtherLanguagesTab] = useState("you")

  return {
    degreesTab,
    setDegreesTab,
    skillsTab,
    setSkillsTab,
    workExpTab,
    setWorkExpTab,
    licensesTab,
    setLicensesTab,
    militaryTab,
    setMilitaryTab,
    studyPlansTab,
    setStudyPlansTab,
    schoolOffersTab,
    setSchoolOffersTab,
    learningGoalsTab,
    setLearningGoalsTab,
    otherLanguagesTab,
    setOtherLanguagesTab
  }
}
